import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatMessageHistory } from 'langchain/memory';

/**
 * 对话状态枚举
 */
export enum ConversationState {
  IDLE = 'idle',
  TASK_PLANNING = 'task_planning',
  TASK_EXECUTION = 'task_execution',
  INFORMATION_GATHERING = 'information_gathering',
  CLARIFICATION_NEEDED = 'clarification_needed'
}

/**
 * 任务上下文信息
 */
export interface TaskContext {
  currentTask?: string;
  taskSteps: string[];
  completedSteps: string[];
  pendingSteps: string[];
  dependencies: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  resources: string[];
}

/**
 * 对话元数据
 */
export interface ConversationMetadata {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  totalMessages: number;
  state: ConversationState;
  taskContext: TaskContext;
  ragContext: string[];
  preferences: Record<string, any>;
}

/**
 * LangChain增强的对话管理器
 */
export class ConversationManager {
  private chatMessageHistory: ChatMessageHistory;
  private metadata: ConversationMetadata;
  private chatHistory: BaseMessage[] = [];
  private maxHistoryLength: number = 20;

  constructor(sessionId: string, options?: {
    maxHistoryLength?: number;
    userId?: string;
    initialState?: ConversationState;
  }) {
    this.chatMessageHistory = new ChatMessageHistory();

    this.metadata = {
      sessionId,
      userId: options?.userId,
      startTime: new Date(),
      lastActivity: new Date(),
      totalMessages: 0,
      state: options?.initialState || ConversationState.IDLE,
      taskContext: {
        taskSteps: [],
        completedSteps: [],
        pendingSteps: [],
        dependencies: [],
        priority: 'medium',
        resources: []
      },
      ragContext: [],
      preferences: {}
    };

    this.maxHistoryLength = options?.maxHistoryLength || 20;
  }

  /**
   * 添加用户消息
   */
  async addUserMessage(content: string, metadata?: Record<string, any>): Promise<void> {
    const message = new HumanMessage({
      content,
      additional_kwargs: metadata || {}
    });
    
    await this.addMessage(message);
    this.updateActivity();
  }

  /**
   * 添加AI消息
   */
  async addAIMessage(content: string, metadata?: Record<string, any>): Promise<void> {
    const message = new AIMessage({
      content,
      additional_kwargs: metadata || {}
    });
    
    await this.addMessage(message);
    this.updateActivity();
  }

  /**
   * 添加系统消息
   */
  async addSystemMessage(content: string): Promise<void> {
    const message = new SystemMessage({ content });
    await this.addMessage(message);
  }

  /**
   * 内部添加消息方法
   */
  private async addMessage(message: BaseMessage): Promise<void> {
    this.chatHistory.push(message);
    this.metadata.totalMessages++;

    // 维护历史长度限制
    if (this.chatHistory.length > this.maxHistoryLength) {
      // 保留系统消息，只裁剪用户和AI消息
      const systemMessages = this.chatHistory.filter(msg => msg instanceof SystemMessage);
      const otherMessages = this.chatHistory.filter(msg => !(msg instanceof SystemMessage));
      
      const trimmedOtherMessages = otherMessages.slice(-this.maxHistoryLength + systemMessages.length);
      this.chatHistory = [...systemMessages, ...trimmedOtherMessages];
    }

    // 保存到聊天历史
    await this.chatMessageHistory.addMessage(message);
  }

  /**
   * 获取对话历史
   */
  getChatHistory(): BaseMessage[] {
    return [...this.chatHistory];
  }



  /**
   * 更新对话状态
   */
  updateState(newState: ConversationState, context?: Partial<TaskContext>): void {
    this.metadata.state = newState;
    if (context) {
      this.metadata.taskContext = { ...this.metadata.taskContext, ...context };
    }
    this.updateActivity();
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): ConversationState {
    return this.metadata.state;
  }



  /**
   * 添加RAG上下文
   */
  addRAGContext(context: string): void {
    this.metadata.ragContext.push(context);
    // 保持RAG上下文数量限制
    if (this.metadata.ragContext.length > 10) {
      this.metadata.ragContext = this.metadata.ragContext.slice(-10);
    }
    this.updateActivity();
  }

  /**
   * 获取RAG上下文
   */
  getRAGContext(): string[] {
    return [...this.metadata.ragContext];
  }



  /**
   * 分析对话模式
   */
  analyzeConversationPattern(): {
    averageResponseTime: number;
    messageFrequency: number;
    topicShifts: number;
    complexity: 'low' | 'medium' | 'high';
  } {
    const totalTime = Date.now() - this.metadata.startTime.getTime();
    const messageCount = this.metadata.totalMessages;
    
    // 简单的模式分析
    const averageResponseTime = messageCount > 0 ? totalTime / messageCount : 0;
    const messageFrequency = messageCount / (totalTime / (1000 * 60 * 60)); // 每小时消息数
    
    // 分析主题转换（简单实现）
    let topicShifts = 0;
    for (let i = 1; i < this.chatHistory.length; i++) {
      const prev = this.chatHistory[i - 1].content.toString().toLowerCase();
      const curr = this.chatHistory[i].content.toString().toLowerCase();
      
      // 简单的主题转换检测（基于关键词变化）
      const prevWords = new Set(prev.split(' ').filter(w => w.length > 3));
      const currWords = new Set(curr.split(' ').filter(w => w.length > 3));
      const intersection = new Set(Array.from(prevWords).filter(x => currWords.has(x)));
      
      if (intersection.size / Math.max(prevWords.size, currWords.size) < 0.3) {
        topicShifts++;
      }
    }

    // 复杂度评估
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (this.metadata.taskContext.taskSteps.length > 5 || topicShifts > 3) {
      complexity = 'high';
    } else if (this.metadata.taskContext.taskSteps.length > 2 || topicShifts > 1) {
      complexity = 'medium';
    }

    return {
      averageResponseTime: Math.round(averageResponseTime),
      messageFrequency: Math.round(messageFrequency * 100) / 100,
      topicShifts,
      complexity
    };
  }

  /**
   * 导出对话数据
   */
  exportConversation(): {
    metadata: ConversationMetadata;
    history: Array<{ role: string; content: string; timestamp: Date }>;
    analysis: ReturnType<typeof this.analyzeConversationPattern>;
  } {
    return {
      metadata: { ...this.metadata },
      history: this.chatHistory.map((msg, index) => ({
        role: msg instanceof HumanMessage ? 'user' : 
              msg instanceof AIMessage ? 'assistant' : 'system',
        content: typeof msg.content === 'string' ? msg.content : msg.content.toString(),
        timestamp: new Date(this.metadata.startTime.getTime() + index * 1000) // 估算时间戳
      })),
      analysis: this.analyzeConversationPattern()
    };
  }

  /**
   * 清理对话历史
   */
  clearHistory(): void {
    this.chatHistory = [];
    this.metadata.totalMessages = 0;
    this.metadata.state = ConversationState.IDLE;
    this.metadata.taskContext = {
      taskSteps: [],
      completedSteps: [],
      pendingSteps: [],
      dependencies: [],
      priority: 'medium',
      resources: []
    };
    this.updateActivity();
  }

  /**
   * 获取对话元数据
   */
  getMetadata(): ConversationMetadata {
    return { ...this.metadata };
  }

  /**
   * 更新活动时间
   */
  private updateActivity(): void {
    this.metadata.lastActivity = new Date();
  }


} 