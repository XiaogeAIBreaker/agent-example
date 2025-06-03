import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { trimMessagesToTokenLimitSync, getTotalTokenCountSync } from '../../utils/tokenTrimmer';

// 允许流式响应最长30秒
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 检查 DeepSeek API key
    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'DeepSeek API key 未配置。请在 .env.local 文件中设置 DEEPSEEK_API_KEY' 
        }),
        { status: 500 }
      );
    }

    // 创建 DeepSeek provider 实例
    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // 构建升级的ReAct系统提示词
    const systemPrompt = `**重要行为指令：你必须总是先用文字回复用户，然后再调用函数。禁止只调用函数而不说话！**

你是一个智能待办事项助手，具备规划和执行多个任务的能力。

你的核心能力：
1. **理解用户复合型指令**，例如："添加任务后显示列表"
2. **逐步思考（Reasoning）并执行操作（Acting）**
3. **使用 Function Calling 完成每一步**
4. **每次最多执行一个函数调用，按顺序完成多个操作**
5. **保持自然友好，逐步展示你的思考与执行**

⚙️ 可调用的函数：
- \`addTodo\`: 添加新任务（参数：task）
- \`completeTodo\`: 完成任务（参数：taskIdentifier）
- \`deleteTodo\`: 删除任务（参数：taskIdentifier）
- \`listTodos\`: 显示所有任务
- \`clearCompleted\`: 清除所有已完成任务
- \`clearAll\`: 清除全部任务

🔥 **绝对强制要求 - 回复格式**：
无论多简单的请求，你都必须按照以下格式回复：

用户："添加买菜任务"
你必须这样回复：
"好的，我来帮你添加买菜任务。

[调用addTodo函数]"

用户："完成任务1"
你必须这样回复：
"我来帮你完成这个任务。

[调用completeTodo函数]"

用户："显示所有任务"
你必须这样回复：
"让我为你列出所有任务。

[调用listTodos函数]"

## 🚨 严格执行规则（违反将导致错误）：
1. **每次回复必须包含文字 + 函数调用**
2. **绝对禁止只调用函数不说话**
3. **即使是最简单的请求也要先用文字说明**
4. **函数调用前必须告诉用户你要做什么**
5. **保持友好自然的语调**

## 标准回复模板：
第一步：文字说明（告诉用户你要做什么）
第二步：函数调用（执行相应操作）

## 上下文处理策略：
- "刚才那个/最后一个任务": 通过任务描述找到最近添加的任务
- "再加一个/再添加": 添加类似的任务
- "完成刚才的": 完成最近提到的任务
- "删除最后添加的": 删除最近添加的任务

⚡ 重要提醒：你的每个回复都必须先有文字说明，然后再调用函数。这是强制要求！`;

    // 创建包含系统提示的完整消息数组
    const systemMessage = { role: 'system' as const, content: systemPrompt };
    const allMessages = [systemMessage, ...messages];

    // Token长度控制
    const maxTokens = 3000;
    const originalTokenCount = getTotalTokenCountSync(allMessages);
    
    console.log(`原始消息Token数量 (估算): ${originalTokenCount}`);
    
    let trimmedMessages = allMessages;
    if (originalTokenCount > maxTokens) {
      try {
        const conversationMessages = messages;
        const systemTokens = getTotalTokenCountSync([systemMessage]);
        const maxConversationTokens = maxTokens - systemTokens - 200;
        
        const trimmedConversation = trimMessagesToTokenLimitSync(
          conversationMessages, 
          maxConversationTokens
        );
        
        trimmedMessages = [systemMessage, ...trimmedConversation];
        
        const trimmedTokenCount = getTotalTokenCountSync(trimmedMessages);
        console.log(`裁剪后消息Token数量 (估算): ${trimmedTokenCount}`);
        console.log(`裁剪了 ${messages.length - trimmedConversation.length} 条历史消息`);
      } catch (error) {
        console.warn('Token裁剪失败，使用原始消息:', error);
        const maxMessageCount = Math.min(messages.length, 10);
        trimmedMessages = [systemMessage, ...messages.slice(-maxMessageCount)];
      }
    }

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      messages: trimmedMessages,
      maxTokens: 1000,
      temperature: 0.3,
      tools: {
        addTodo: {
          description: 'Add a new todo task. Always respond with text before calling this function.',
          parameters: z.object({
            task: z.string().describe('The task content')
          })
        },
        completeTodo: {
          description: 'Complete a todo task. Always respond with text before calling this function.',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or description')
          })
        },
        deleteTodo: {
          description: 'Delete a todo task. Always respond with text before calling this function.',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or description')
          })
        },
        listTodos: {
          description: 'List all todo tasks. Always respond with text before calling this function.',
          parameters: z.object({})
        },
        clearCompleted: {
          description: 'Clear all completed tasks. Always respond with text before calling this function.',
          parameters: z.object({})
        },
        clearAll: {
          description: 'Clear all tasks. Always respond with text before calling this function.',
          parameters: z.object({})
        }
      },
      toolChoice: 'auto',
      onFinish: (result) => {
        console.log('AI完成响应:', {
          text: result.text,
          toolCalls: result.toolCalls,
          usage: result.usage
        });
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务暂时不可用，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 