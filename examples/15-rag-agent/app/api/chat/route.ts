import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { trimMessagesToTokenLimitSync, getTotalTokenCountSync } from '../../utils/tokenTrimmer';
import { getTodoManager } from './todoManager';
import { getVectorService } from '../../utils/vectorService';
import { getRagService } from '../../utils/ragService';

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

    // 获取服务实例
    const todoManager = getTodoManager();
    const vectorService = getVectorService();
    const ragService = getRagService();

    // 获取用户最新消息进行RAG检索
    const userMessage = messages[messages.length - 1]?.content || '';
    let ragContext = '';
    
    if (userMessage && await vectorService.isAvailable() && ragService.isAvailable()) {
      try {
        console.log('🔍 开始RAG知识检索...');
        const queryEmbedding = await vectorService.embedText(userMessage);
        const knowledgeResults = await ragService.searchKnowledge(queryEmbedding, 3, 0.3);
        
        if (knowledgeResults.length > 0) {
          ragContext = ragService.formatKnowledgeContext(knowledgeResults);
          console.log(`📚 RAG检索成功，获得 ${knowledgeResults.length} 条相关知识`);
        }
      } catch (error) {
        console.warn('⚠️ RAG检索失败，继续使用基础模式:', error);
      }
    }

    // CoT Agent 专用系统提示词 - 升级为RAG+Few-shot版本
    const systemPrompt = `你是一个具备透明化思考能力的智能任务助手，拥有RAG知识检索和Few-shot学习能力。你需要使用Chain of Thought (CoT)模式来处理用户请求。

**正确的CoT工作流程：**
1. **首先进行思考分析** - 在回复开头直接展示你的推理过程
2. **然后基于思考进行决策** - 调用相应的工具执行操作
3. **最后总结结果** - 说明执行结果和建议

**重要：你必须在调用任何工具之前，先在文字回复中展示完整的思考过程！**

## 标准CoT回复格式：

🧠 **思考过程：**
[在这里详细说明你的分析推理过程，包括：]
- 对用户请求的理解
- 问题分析和判断依据  
- 制定的执行计划
- 预期的结果评估

📋 **执行计划：**
[基于上述思考，我将执行以下操作...]

[然后调用相应的工具]

✅ **执行结果：**
[工具执行完成后的总结]

## Few-shot 示例对话：

**【示例 1】**
用户："今天要做：写日报、整理桌面、联系客户"

助手回复：
🧠 **思考过程：**
用户列出了三个明确的任务，表达简洁直接。这是典型的任务添加请求，需要分别将每个任务创建为待办事项。三个任务都是具体的行动项：
1. "写日报" - 工作相关的文档任务
2. "整理桌面" - 物理环境整理任务  
3. "联系客户" - 沟通相关任务

我需要依次添加这三个任务到待办清单中。

📋 **执行计划：**
基于上述分析，我将调用三次addTodo功能，分别添加"写日报"、"整理桌面"、"联系客户"三个任务。

✅ **执行结果：**
已成功添加三个任务到你的待办清单中。

---

**【示例 2】**
用户："记一下：洗衣服、去超市、打电话给老妈"

助手回复：
🧠 **思考过程：**  
用户使用"记一下"这种提醒类表达，但本质意图仍是要添加待办任务。这种口语化的表达方式很常见，背后的需求是创建任务提醒。三个任务分别是：
1. "洗衣服" - 家务类任务
2. "去超市" - 外出购物任务
3. "打电话给老妈" - 家庭沟通任务

虽然用词是"记一下"，但实际操作应该是添加到待办清单。

📋 **执行计划：**
识别用户真实意图后，我将执行addTodo("洗衣服")、addTodo("去超市")、addTodo("打电话给老妈")三个操作。

✅ **执行结果：**
三个提醒任务已成功创建，你可以随时查看和管理这些待办事项。

---

**【示例 3】**
用户："今天心情不好，帮我想三个要做的事"

助手回复：
🧠 **思考过程：**
用户今天心情不好，我需要推荐一些能够改善情绪的活动。根据心理学研究，以下类型的活动通常有助于提升情绪：
1. 轻度运动（如散步）- 能释放内啡肽，改善心情
2. 创造性活动（如写作、绘画）- 有助于情绪表达和转移注意力
3. 社交互动（如联系朋友）- 获得情感支持和温暖

我建议选择简单易行、不需要太多准备的活动，让用户能够轻松开始。

📋 **执行计划：**
基于上述分析，我将为用户添加三个有助于改善心情的任务。

✅ **执行结果：**
已成功为你添加了三个改善心情的任务，建议按个人喜好选择执行顺序。

⚠️ **格式要求：**
- 每次回复必须完整包含 🧠 思考过程 / 📋 执行计划 / ✅ 执行结果 三段结构，顺序不可改变
- 所有执行操作必须通过已定义的工具调用完成
- 严禁输出闲聊、重复内容、模糊语气（如"也许""可能"）
- 必须保持结构化、明确、严谨

**关键要点：**
- 思考过程必须在工具调用之前展示
- 思考要具体、有逻辑、有依据
- 每次回复都要遵循这个CoT格式
- 不要使用cotThink工具，直接在文字中展示思考过程

可用工具：
- addTodo: 添加新任务，参数 {task: string}
- completeTodo: 完成任务，参数 {taskIdentifier: string}  
- deleteTodo: 删除任务，参数 {taskIdentifier: string}
- listTodos: 查看所有任务，无参数
- clearCompleted: 清理已完成任务，无参数
- clearAll: 清理所有任务，无参数

记住：真正的CoT是先思考再行动，让用户看到你的推理过程如何指导你的决策！

${ragContext}`;

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

    // 使用 streamText 实现流式输出和 CoT Agent Loop
    const result = await streamText({
      model: deepseek('deepseek-chat'),
      messages: trimmedMessages,
      maxTokens: 1500,
      temperature: 0.3,
      maxSteps: 7, // 最大步骤数，实现多轮执行
      tools: {
        addTodo: {
          description: 'Add a new todo task.',
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
          description: 'Complete a todo task.',
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
          description: 'Delete a todo task.',
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
          description: 'List all todo tasks.',
          parameters: z.object({}),
          execute: async () => {
            console.log(`🔧 执行工具: listTodos`);
            const result = todoManager.listTodos();
            console.log(`📋 ListTodos结果:`, result);
            return result.message;
          }
        },
        clearCompleted: {
          description: 'Clear all completed tasks.',
          parameters: z.object({}),
          execute: async () => {
            console.log(`🔧 执行工具: clearCompleted`);
            const result = todoManager.clearCompleted();
            console.log(`🧹 ClearCompleted结果:`, result);
            return result.message;
          }
        },
        clearAll: {
          description: 'Clear all tasks.',
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
        console.log(`🔄 CoT步骤完成:`, {
          stepType: stepResult.stepType,
          text: stepResult.text ? stepResult.text.substring(0, 100) + '...' : '',
          toolCalls: stepResult.toolCalls?.length || 0,
          finishReason: stepResult.finishReason
        });
      }
    });

    console.log(`🚀 CoT Agent Loop 流式响应已启动`);

    // 返回流式响应
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('❌ CoT Agent API 错误:', error);
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