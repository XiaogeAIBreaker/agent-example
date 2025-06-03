import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { trimMessagesToTokenLimitSync, getTotalTokenCountSync } from '../../utils/tokenTrimmer';
import { getTodoManager } from './todoManager';

// 允许最长60秒处理时间（Agent Loop可能需要多轮执行）
export const maxDuration = 60;

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

    // 获取TodoManager实例
    const todoManager = getTodoManager();

    // Agent Loop 专用系统提示词
    const systemPrompt = `你是一个智能任务助手，目标是根据用户请求完成一个复杂计划。你需要"边思考、边行动"，每次只执行一步操作，并在获取结果后再决定下一步。

你的核心能力包括：
1. 智能判断用户请求的真实意图；
2. 拆解用户的复合型请求；
3. 使用 Function Calling 执行每一步；
4. 在收到函数执行结果后，判断是否继续；
5. 重复执行，直到目标完成。

⚠️ 你的工作模式：

**模式1 - 待办事项管理**（当用户请求涉及任务管理时）：
严格按照以下格式执行：

第一步：文字回复（说明你将要做什么）  
第二步：调用函数（使用 Function Calling 执行）

⛔ 你**必须每次只调用一个函数**，执行后观察结果再继续。

可用函数如下：
- \`addTodo(task: string)\` - 添加新任务
- \`completeTodo(taskIdentifier: string)\` - 完成任务
- \`deleteTodo(taskIdentifier: string)\` - 删除任务
- \`listTodos()\` - 查看所有任务
- \`clearCompleted()\` - 清理已完成任务
- \`clearAll()\` - 清理所有任务

🎯 示例执行：

用户："添加三个学习任务然后完成第一个"

第一轮：
> "我先添加第一个学习任务'学习Python'"
> [调用 addTodo()]

第二轮：
> "现在添加第二个学习任务'阅读技术文档'"
> [调用 addTodo()]

第三轮：
> "添加第三个学习任务'练习编程'"
> [调用 addTodo()]

第四轮：
> "现在完成第一个任务'学习Python'"
> [调用 completeTodo()]

⚠️ 每次回复都必须包括自然语言说明 + 工具调用。

**模式2 - 普通对话**（当用户请求不涉及任务管理时）：
直接进行对话回答，无需调用工具。

**模式3 - 询问澄清**（当请求模糊时）：
通过提问澄清用户意图，确认是否需要进行任务管理操作。

在每一步之后，请根据前一步的执行结果决定下一步要做什么。`;

    // 创建包含系统提示的完整消息数组
    const systemMessage = { role: 'system' as const, content: systemPrompt };
    const allMessages = [systemMessage, ...messages];

    // Token长度控制
    const maxTokens = 4000;
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
        const maxMessageCount = Math.min(messages.length, 15);
        trimmedMessages = [systemMessage, ...messages.slice(-maxMessageCount)];
      }
    }

    // 使用 streamText 实现流式输出和 Agent Loop
    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: trimmedMessages,
      maxTokens: 1500,
      temperature: 0.3,
      maxSteps: 7, // 最大步骤数，实现多轮执行
      tools: {
        addTodo: {
          description: 'Add a new todo task. Call this after explaining what you will do.',
          parameters: z.object({
            task: z.string().describe('The task content to add')
          }),
          execute: async ({ task }: { task: string }) => {
            console.log(`🔧 执行工具: addTodo, 参数: ${task}`);
            const result = todoManager.addTodo(task);
            console.log(`📝 AddTodo结果:`, result);
            return result.message;
          }
        },
        completeTodo: {
          description: 'Complete a todo task. Call this after explaining what you will do.',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or task description to complete')
          }),
          execute: async ({ taskIdentifier }: { taskIdentifier: string }) => {
            console.log(`🔧 执行工具: completeTodo, 参数: ${taskIdentifier}`);
            const result = todoManager.completeTodo(taskIdentifier);
            console.log(`✅ CompleteTodo结果:`, result);
            return result.message;
          }
        },
        deleteTodo: {
          description: 'Delete a todo task. Call this after explaining what you will do.',
          parameters: z.object({
            taskIdentifier: z.string().describe('Task ID or task description to delete')
          }),  
          execute: async ({ taskIdentifier }: { taskIdentifier: string }) => {
            console.log(`🔧 执行工具: deleteTodo, 参数: ${taskIdentifier}`);
            const result = todoManager.deleteTodo(taskIdentifier);
            console.log(`🗑️ DeleteTodo结果:`, result);
            return result.message;
          }
        },
        listTodos: {
          description: 'List all todo tasks. Call this after explaining what you will do.',
          parameters: z.object({}),
          execute: async () => {
            console.log(`🔧 执行工具: listTodos`);
            const result = todoManager.listTodos();
            console.log(`📋 ListTodos结果:`, result);
            return result.message;
          }
        },
        clearCompleted: {
          description: 'Clear all completed tasks. Call this after explaining what you will do.',
          parameters: z.object({}),
          execute: async () => {
            console.log(`🔧 执行工具: clearCompleted`);
            const result = todoManager.clearCompleted();
            console.log(`🧹 ClearCompleted结果:`, result);
            return result.message;
          }
        },
        clearAll: {
          description: 'Clear all tasks. Call this after explaining what you will do.',
          parameters: z.object({}),
          execute: async () => {
            console.log(`🔧 执行工具: clearAll`);
            const result = todoManager.clearAll();
            console.log(`🧹 ClearAll结果:`, result);
            return result.message;
          }
        }
      },
      toolChoice: 'auto',
      onStepFinish: (stepResult) => {
        console.log(`🔄 步骤完成:`, {
          stepType: stepResult.stepType,
          text: stepResult.text ? stepResult.text.substring(0, 100) + '...' : '',
          toolCalls: stepResult.toolCalls?.length || 0,
          finishReason: stepResult.finishReason
        });
        
        // 如果步骤没有调用工具但也没完成，给出警告
        if (stepResult.stepType === 'continue' && (!stepResult.toolCalls || stepResult.toolCalls.length === 0)) {
          console.warn('⚠️ AI没有调用工具但继续执行，可能会跳过实际操作');
        }
      }
    });

    console.log(`🚀 Agent Loop 流式响应已启动`);

    // 返回流式响应
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('❌ Agent Loop API 错误:', error);
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