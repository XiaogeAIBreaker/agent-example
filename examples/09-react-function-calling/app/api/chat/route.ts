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

    // 构建ReAct模式的系统提示词
    const systemPrompt = `你是一个智能ReAct助手，使用ReAct模式执行多步任务规划。

## 重要：连续执行模式
由于技术架构限制，你需要在一次响应中完成整个ReAct流程：

1. 先进行完整的任务分析和规划
2. 然后连续调用多个函数来执行完整流程
3. 每次函数调用后，继续调用下一个必要的函数

## ReAct执行策略：
对于复杂任务，你应该：
- 首先分析整个任务需要哪些步骤
- 然后连续调用所有必要的函数
- 不要等待用户再次输入

## 多步任务示例：
用户说："写日报前先完成当前的任务"

正确的执行方式：

整体规划: 这个任务需要3个步骤：
1. 查询当前未完成任务
2. 完成所有未完成任务  
3. 生成日报任务

现在开始执行：
Step 1: 查询当前任务状态 [调用 queryCurrentTasks]
Step 2: 完成所有未完成任务 [调用 completeAllTasks]  
Step 3: 生成日报任务 [调用 generateDailyReport]
总结: 已完成完整流程：查询-完成-生成日报

## 可用的函数：

### 基础任务函数
- addTodo: 添加新任务
- completeTodo: 完成指定任务
- deleteTodo: 删除任务
- listTodos: 列出所有任务
- clearCompleted: 清除已完成任务
- clearAll: 清除所有任务

### 多步任务函数 (重点)
- queryCurrentTasks: 查询当前未完成任务列表
- completeAllTasks: 批量完成全部未完成任务
- generateDailyReport: 生成日报任务
- taskSummary: 获取任务执行摘要

## 执行原则：
1. 一次性规划：分析任务需要的所有步骤
2. 连续执行：在一次响应中调用所有必要的函数
3. 不要停顿：不要在中途等待用户输入
4. 完整闭环：确保用户需求得到完全满足

## 特别注意：
- 对于"写日报前先完成任务"这类请求，你应该连续调用：queryCurrentTasks -> completeAllTasks -> generateDailyReport
- 对于"整理任务并汇报"这类请求，你应该连续调用：taskSummary -> completeAllTasks -> generateDailyReport
- 每个函数调用都是为了完成整体目标的一个步骤

请严格按照这个模式执行，确保在一次响应中完成完整的多步流程！`;

    // 创建包含系统提示的完整消息数组
    const systemMessage = { role: 'system' as const, content: systemPrompt };
    const allMessages = [systemMessage, ...messages];

    // Token长度控制
    const maxTokens = 4000; // 增加token限制以支持更长的ReAct对话
    const originalTokenCount = getTotalTokenCountSync(allMessages);
    
    console.log(`原始消息Token数量 (估算): ${originalTokenCount}`);
    
    let trimmedMessages = allMessages;
    if (originalTokenCount > maxTokens) {
      try {
        const conversationMessages = messages;
        const systemTokens = getTotalTokenCountSync([systemMessage]);
        const maxConversationTokens = maxTokens - systemTokens - 300;
        
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
        const maxMessageCount = Math.min(messages.length, 12);
        trimmedMessages = [systemMessage, ...messages.slice(-maxMessageCount)];
      }
    }

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      messages: trimmedMessages,
      maxTokens: 2000, // 增加输出token限制以支持完整的ReAct链
      temperature: 0.3, // 降低温度使AI更专注于逻辑推理
      tools: {
        // 基础任务函数
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
        },
        
        // 新增多步任务函数
        queryCurrentTasks: {
          description: 'Query current uncompleted tasks - useful for multi-step planning',
          parameters: z.object({
            includeCompleted: z.boolean().optional().describe('Whether to include completed tasks')
          })
        },
        completeAllTasks: {
          description: 'Complete all uncompleted tasks at once',
          parameters: z.object({
            confirmMessage: z.string().optional().describe('Confirmation message for batch completion')
          })
        },
        generateDailyReport: {
          description: 'Generate a daily report task based on current tasks',
          parameters: z.object({
            reportType: z.string().optional().describe('Type of report (daily, weekly, summary)')
          })
        },
        taskSummary: {
          description: 'Get a summary of all task operations and status',
          parameters: z.object({
            detailed: z.boolean().optional().describe('Whether to include detailed information')
          })
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