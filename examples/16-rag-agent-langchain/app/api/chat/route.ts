/**
 * RAG+LangChain 智能代理聊天API
 * 
 * 这是系统的主要API端点，处理用户的聊天请求并返回AI响应：
 * 
 * 核心功能：
 * - 集成LangChain代理管理器处理复杂任务
 * - 支持RAG知识检索和Few-shot学习
 * - 实现Chain of Thought透明思考过程
 * - 提供完整的工具调用支持（待办任务管理）
 * - 智能Token管理和历史消息裁剪
 * - 流式响应生成
 * 
 * 技术栈：
 * - Vercel AI SDK: 流式文本生成和工具调用
 * - DeepSeek API: 大语言模型服务
 * - LangChain: 代理框架和组件集成
 * - TensorFlow: 向量化服务
 * 
 * 支持的工具：
 * - addTodo: 添加待办任务
 * - completeTodo: 完成任务
 * - deleteTodo: 删除任务
 * - listTodos: 查看任务列表
 * - clearCompleted: 清理已完成任务
 * - clearAll: 清理所有任务
 */

import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { trimMessagesToTokenLimitSync, getTotalTokenCountSync } from '../../utils/tokenTrimmer';
import { getTodoManager } from './todoManager';
import { createDefaultAgent, AgentManager } from '../../lib/langchain';

/**
 * 全局代理管理器缓存
 * 
 * 维护会话级别的代理实例，确保对话连续性：
 * - Key: sessionId (会话标识符)
 * - Value: AgentManager (代理管理器实例)
 */
const agentCache = new Map<string, AgentManager>();

/**
 * 获取或创建会话对应的代理实例
 * 
 * 实现代理实例的懒加载和缓存机制：
 * 1. 检查缓存中是否存在该会话的代理
 * 2. 如不存在则创建新的默认代理实例
 * 3. 返回可用的代理管理器
 * 
 * @param sessionId - 会话唯一标识符
 * @returns AgentManager - 代理管理器实例
 */
function getAgentForSession(sessionId: string): AgentManager {
  if (!agentCache.has(sessionId)) {
    agentCache.set(sessionId, createDefaultAgent(sessionId));
  }
  return agentCache.get(sessionId)!;
}

/**
 * API超时配置
 * 
 * 设置为60秒以支持复杂的Agent Loop操作：
 * - RAG知识检索可能需要较长时间
 * - 复杂任务的规划和分解
 * - 多轮工具调用的执行
 * - TensorFlow模型的加载和推理
 */
export const maxDuration = 60;

/**
 * POST请求处理器 - 处理聊天消息
 * 
 * 这是API的主要入口点，实现完整的聊天处理流程：
 * 
 * 处理流程：
 * 1. 请求验证和消息提取
 * 2. 会话管理和代理获取
 * 3. LangChain代理处理（RAG检索、任务分析、工具准备）
 * 4. Token管理和消息裁剪
 * 5. 工具定义和执行逻辑
 * 6. 流式文本生成和响应
 * 
 * 错误处理：
 * - 请求格式验证
 * - 消息内容检查
 * - 代理处理异常捕获
 * - 流式生成错误处理
 * 
 * @param req - HTTP请求对象
 * @returns Response - 流式响应或错误响应
 */
export async function POST(req: Request) {
  try {
    // 1. 解析和验证请求数据
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request format', { status: 400 });
    }

    const userMessage = messages[messages.length - 1]?.content;
    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    console.log(`📨 收到用户消息: ${userMessage}`);

    // 2. 会话管理 - 获取或生成会话ID
    // 生产环境应从认证信息或请求头中获取真实的会话ID
    const sessionId = req.headers.get('x-session-id') || 'default-session';
    
    // 3. 代理实例获取 - 获取该会话对应的代理管理器
    const agent = getAgentForSession(sessionId);
    
    // 4. LangChain代理处理 - 核心处理逻辑
    // 这里会触发RAG检索、任务分析、工具准备等复杂流程
    console.log('🤖 使用LangChain代理处理请求...');
    const agentResponse = await agent.processInput(userMessage);
    
    console.log('✅ LangChain代理处理完成:', {
      messageCount: agentResponse.messages.length,
      toolCount: Object.keys(agentResponse.toolCalls).length,
      hasRAG: !!agentResponse.ragContext,
      state: agentResponse.conversationState
    });

    // 提取系统消息和用户消息
    const systemMessage = agentResponse.messages.find(msg => msg.role === 'system');
    const formattedMessages: any = [
      ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
      ...messages.slice(0, -1), // 历史消息
      { role: 'user', content: userMessage } // 当前用户消息
    ];

    // Token长度控制
    const maxTokens = 4000;
    const originalTokenCount = getTotalTokenCountSync(formattedMessages);
    
    console.log(`原始消息Token数量 (估算): ${originalTokenCount}`);
    
    let trimmedMessages = formattedMessages;
    if (originalTokenCount > maxTokens) {
      try {
        const conversationMessages = messages;
        const systemTokens = systemMessage ? getTotalTokenCountSync([{ role: 'system', content: systemMessage.content }]) : 0;
        const maxConversationTokens = maxTokens - systemTokens - 200;
        
        const trimmedConversation = trimMessagesToTokenLimitSync(
          conversationMessages, 
          maxConversationTokens
        );
        
         trimmedMessages = [
           ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
           ...trimmedConversation
         ] as any;
        
        const trimmedTokenCount = getTotalTokenCountSync(trimmedMessages);
        console.log(`裁剪后消息Token数量 (估算): ${trimmedTokenCount}`);
        console.log(`裁剪了 ${messages.length - trimmedConversation.length} 条历史消息`);
      } catch (error) {
        console.warn('Token裁剪失败，使用原始消息:', error);
      }
    }

    // 准备工具定义
    const tools = {
      addTodo: {
        description: '添加新的待办任务',
        parameters: z.object({
          task: z.string().describe('要添加的任务内容'),
        }),
        execute: async ({ task }: { task: string }) => {
          console.log(`🔧 执行工具: addTodo, 参数: ${task}`);
          const result = getTodoManager().addTodo(task);
          console.log(`📝 AddTodo结果:`, result);
          
          // 通知代理工具执行结果
          await agent.handleToolResult('addTodo', result);
          
          // 返回更详细的结果信息，包含成功状态和任务详情
          return {
            success: result.success,
            message: result.message,
            todo: result.todo,
            instruction: "请继续输出执行结果总结，告知用户任务添加的情况。"
          };
        },
      },
      completeTodo: {
        description: '标记待办任务为已完成',
        parameters: z.object({
          taskIdentifier: z.string().describe('任务ID或任务描述'),
        }),
        execute: async ({ taskIdentifier }: { taskIdentifier: string }) => {
          console.log(`🔧 执行工具: completeTodo, 参数: ${taskIdentifier}`);
          const result = getTodoManager().completeTodo(taskIdentifier);
          console.log(`✅ CompleteTodo结果:`, result);
          
                     await agent.handleToolResult('completeTodo', result);
           
           return {
             success: result.success,
             message: result.message,
             todo: result.todo
           };
         },
       },
       deleteTodo: {
         description: '删除待办任务',
         parameters: z.object({
           taskIdentifier: z.string().describe('任务ID或任务描述'),
         }),
         execute: async ({ taskIdentifier }: { taskIdentifier: string }) => {
           console.log(`🔧 执行工具: deleteTodo, 参数: ${taskIdentifier}`);
           const result = getTodoManager().deleteTodo(taskIdentifier);
           console.log(`🗑️ DeleteTodo结果:`, result);
           
           await agent.handleToolResult('deleteTodo', result);
           
           return {
             success: result.success,
             message: result.message
           };
         },
       },
       listTodos: {
         description: '查看所有待办任务',
         parameters: z.object({}),
         execute: async () => {
           console.log(`🔧 执行工具: listTodos`);
           const result = getTodoManager().listTodos();
           console.log(`📋 ListTodos结果:`, result);
           
           await agent.handleToolResult('listTodos', result);
           
           return {
             success: result.success,
             message: result.message,
             todos: result.todos
           };
         },
       },
       clearCompleted: {
         description: '清理所有已完成的任务',
         parameters: z.object({}),
         execute: async () => {
           console.log(`🔧 执行工具: clearCompleted`);
           const result = getTodoManager().clearCompleted();
           console.log(`🧹 ClearCompleted结果:`, result);
           
           await agent.handleToolResult('clearCompleted', result);
           
           return {
             success: result.success,
             message: result.message
           };
         },
       },
       clearAll: {
         description: '清理所有任务',
         parameters: z.object({}),
         execute: async () => {
           console.log(`🔧 执行工具: clearAll`);
           const result = getTodoManager().clearAll();
           console.log(`🧹 ClearAll结果:`, result);
           
           await agent.handleToolResult('clearAll', result);
          
          return {
            success: result.success,
            message: result.message
          };
        },
      },
    };

    // 创建DeepSeek模型实例
    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    console.log('🚀 开始流式生成回复...');

    // 使用@vercel/ai-sdk进行流式文本生成
    const result = await streamText({
      model: deepseek('deepseek-chat'),
      messages: trimmedMessages,
      tools,
      maxTokens: 1500,
      temperature: 0.7,
      toolChoice: 'auto', // 确保工具可以被调用
      maxSteps: 5, // 允许多步骤执行
      onFinish: async (result) => {
        console.log('✅ 流式生成完成');
        console.log(`📊 使用Token: ${result.usage?.totalTokens || 'unknown'}`);
        console.log(`🔧 工具调用次数: ${result.toolCalls?.length || 0}`);
        
        // 记录AI响应到对话历史
        if (result.text) {
          // 这里可以添加AI响应的记录逻辑
          console.log('💬 AI响应已生成');
        }
      },
    });

    return result.toAIStreamResponse();

  } catch (error) {
    console.error('❌ API处理失败:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 