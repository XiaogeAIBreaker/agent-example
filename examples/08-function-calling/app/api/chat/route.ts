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

    // 构建系统提示词
    const systemPrompt = `你是一个智能待办事项助手，使用Function Calling与用户互动。你的主要能力：

1. **理解用户的自然语言指令**，包括上下文引用
2. **自动调用合适的函数**来执行用户请求的操作
3. **处理上下文引用**，如"刚才那个"、"最后一个"、"再加一个"等

## 可用的函数：
- \`addTodo\`: 添加新任务
- \`completeTodo\`: 完成任务
- \`deleteTodo\`: 删除任务
- \`listTodos\`: 列出所有任务
- \`clearCompleted\`: 清除已完成任务
- \`clearAll\`: 清除所有任务

## 上下文处理策略：
- "刚才那个/最后一个任务": 通过任务描述找到最近添加的任务
- "再加一个/再添加": 添加类似的任务
- "完成刚才的": 完成最近提到的任务
- "删除最后添加的": 删除最近添加的任务

## 交互原则：
1. 根据用户意图选择合适的函数调用
2. 优先使用函数调用而非纯文本回复
3. 对于模糊的引用，基于上下文做出合理判断
4. 在函数调用失败时提供友好的解释
5. 保持对话的自然性和友好性

请根据用户的请求，智能地选择和调用相应的函数。`;

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
      temperature: 0.7,
      tools: {
        addTodo: {
          description: 'Add a new todo task',
          parameters: z.object({
            task: z.string().describe('The task content')
          })
        },
        completeTodo: {
          description: 'Complete a todo task',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or description')
          })
        },
        deleteTodo: {
          description: 'Delete a todo task',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or description')
          })
        },
        listTodos: {
          description: 'List all todo tasks',
          parameters: z.object({})
        },
        clearCompleted: {
          description: 'Clear all completed tasks',
          parameters: z.object({})
        },
        clearAll: {
          description: 'Clear all tasks',
          parameters: z.object({})
        }
      },
      toolChoice: 'auto'
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