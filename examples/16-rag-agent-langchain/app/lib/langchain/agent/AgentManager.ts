import { ConversationManager, ConversationState } from '../memory/ConversationManager';
import { createTaskChain, TaskChain } from '../chains/TaskChain';
import { AgentRole, TaskComplexity } from '../prompts/PromptTemplates';
import { getToolRegistry } from '../tools/ToolRegistry';
import { getTaskPlanner } from '../planners/TaskPlanner';

/**
 * 代理会话配置选项
 * 
 * 定义创建Agent会话时的配置参数，包括基础设置和功能开关
 */
export interface AgentSessionOptions {
  sessionId: string;                    // 会话唯一标识符
  userId?: string;                      // 用户ID（可选）
  defaultRole?: AgentRole;              // 默认代理角色
  defaultComplexity?: TaskComplexity;   // 默认任务复杂度
  enableRAG?: boolean;                  // 是否启用RAG知识检索
  enablePlanning?: boolean;             // 是否启用任务规划功能
  maxHistoryLength?: number;            // 对话历史最大长度
}

/**
 * 代理响应格式
 * 
 * 定义Agent处理用户输入后返回的标准化响应格式，包含所有必要的信息
 */
export interface AgentResponse {
  messages: Array<{ role: string; content: string }>; // 格式化的消息数组
  toolCalls: Record<string, any>;                     // 可用的工具调用定义
  ragContext?: string;                                 // RAG检索的知识库内容
  taskAnalysis?: any;                                  // 任务分析结果
  conversationState: ConversationState;               // 当前对话状态
  metadata: {                                          // 响应元数据
    role: AgentRole;                                   // 当前角色
    complexity: TaskComplexity;                        // 任务复杂度
    sessionId: string;                                 // 会话ID
    messageCount: number;                              // 消息计数
    analysisData?: any;                                // 分析数据（可选）
  };
}

/**
 * LangChain代理管理器
 * 
 * 这是系统的核心类，负责协调和管理整个AI代理的生命周期：
 * - 管理对话状态和历史记录
 * - 协调TaskChain进行任务处理
 * - 集成工具注册表和任务规划器
 * - 提供统一的代理服务接口
 * 
 * 架构层次：
 * AgentManager -> TaskChain -> [ConversationManager, ToolRegistry, TaskPlanner, RAGRetriever]
 */
export class AgentManager {
  // 核心组件实例
  private conversationManager: ConversationManager;  // 对话管理器
  private taskChain: TaskChain;                      // 任务处理链
  private toolRegistry = getToolRegistry();         // 工具注册表
  private taskPlanner = getTaskPlanner();           // 任务规划器

  /**
   * 构造函数 - 初始化代理管理器
   * 
   * 根据配置选项创建和配置各个组件实例：
   * 1. 创建对话管理器并设置历史长度限制
   * 2. 创建任务处理链并配置功能开关
   * 3. 初始化工具注册表和任务规划器
   * 
   * @param options - 代理会话配置选项
   */
  constructor(private options: AgentSessionOptions) {
    this.conversationManager = new ConversationManager(options.sessionId, {
      maxHistoryLength: options.maxHistoryLength,
      userId: options.userId,
      initialState: ConversationState.IDLE
    });

    this.taskChain = createTaskChain(this.conversationManager, {
      defaultRole: options.defaultRole,
      defaultComplexity: options.defaultComplexity,
      enableRAG: options.enableRAG,
      enablePlanning: options.enablePlanning
    });
  }

  /**
   * 处理用户输入
   * 
   * 这是主要的入口方法，处理用户的输入并返回标准化的响应：
   * 1. 将输入传递给TaskChain进行处理
   * 2. 整合RAG检索、任务分析、工具调用等结果
   * 3. 返回包含所有必要信息的标准化响应
   * 
   * @param input - 用户输入的文本
   * @returns Promise<AgentResponse> - 标准化的代理响应
   */
  async processInput(input: string): Promise<AgentResponse> {
    const chainResult = await this.taskChain.call({ input });
    return {
      messages: chainResult.output,
      toolCalls: chainResult.toolCalls,
      ragContext: chainResult.ragContext,
      taskAnalysis: chainResult.taskAnalysis,
      conversationState: chainResult.conversationState,
      metadata: chainResult.metadata
    };
  }

  /**
   * 处理工具执行结果
   * 
   * 当工具执行完成后，将结果反馈给系统以更新对话状态：
   * 1. 记录工具执行的结果
   * 2. 更新对话历史
   * 3. 为后续的AI响应提供上下文
   * 
   * @param toolName - 执行的工具名称
   * @param result - 工具执行的结果
   */
  async handleToolResult(toolName: string, result: any): Promise<void> {
    await this.taskChain.handleToolResult(toolName, result);
  }
}

/**
 * 创建默认配置的代理实例
 * 
 * 这是一个便利函数，使用推荐的默认配置创建AgentManager实例：
 * - 角色：TODO_EXECUTOR（任务执行者）
 * - 复杂度：MODERATE（中等复杂度）
 * - 启用RAG知识检索功能
 * - 启用任务规划功能
 * 
 * @param sessionId - 会话唯一标识符
 * @returns AgentManager - 配置好的代理管理器实例
 */
export function createDefaultAgent(sessionId: string): AgentManager {
  return new AgentManager({
    sessionId,
    defaultRole: AgentRole.TODO_EXECUTOR,
    defaultComplexity: TaskComplexity.MODERATE,
    enableRAG: true,
    enablePlanning: true
  });
} 