import { BaseChain } from 'langchain/chains';
import { ChainValues } from '@langchain/core/utils/types';
import { CallbackManagerForChainRun } from '@langchain/core/callbacks/manager';
import { AgentRole, TaskComplexity, PromptTemplateBuilder } from '../prompts/PromptTemplates';
import { getToolRegistry } from '../tools/ToolRegistry';
import { createRAGRetriever } from '../retrievers/RAGRetriever';
import { ConversationManager, ConversationState } from '../memory/ConversationManager';
import { getTaskPlanner, TaskAnalysis } from '../planners/TaskPlanner';

/**
 * 任务处理链
 * 整合LangChain的各个组件来处理复杂任务
 */
export class TaskChain extends BaseChain {
  get lc_namespace() {
    return ['task_chain'];
  }
  
  private toolRegistry = getToolRegistry();
  private ragRetriever = createRAGRetriever();
  private taskPlanner = getTaskPlanner();

  constructor(
    private conversationManager: ConversationManager,
    private options: {
      defaultRole?: AgentRole;
      defaultComplexity?: TaskComplexity;
      enableRAG?: boolean;
      enablePlanning?: boolean;
    } = {}
  ) {
    super();
  }

  get inputKeys(): string[] {
    return ['input'];
  }

  get outputKeys(): string[] {
    return ['output', 'toolCalls', 'ragContext', 'taskAnalysis'];
  }

  async _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const input = values.input as string;
    
    await runManager?.handleText(`开始处理任务: ${input}`);

    // 1. 分析任务复杂度和类型
    const taskAnalysis = this.options.enablePlanning 
      ? this.taskPlanner.analyzeTask(input)
      : null;

    await runManager?.handleText(`任务分析完成: ${taskAnalysis?.complexity || 'simple'}`);

    // 2. RAG检索相关知识
    let ragContext = '';
    if (this.options.enableRAG) {
      try {
        const documents = await this.ragRetriever._getRelevantDocuments(input);
        ragContext = documents.map(doc => doc.pageContent).join('\n');
        this.conversationManager.addRAGContext(ragContext);
        await runManager?.handleText(`RAG检索完成，获得${documents.length}条相关知识`);
      } catch (error) {
        await runManager?.handleText(`RAG检索失败: ${error}`);
      }
    }

    // 3. 确定角色和复杂度
    const role = taskAnalysis?.requiredRole || this.options.defaultRole || AgentRole.TODO_EXECUTOR;
    const complexity = taskAnalysis?.complexity || this.options.defaultComplexity || TaskComplexity.MODERATE;

    // 4. 构建系统提示词（简化版本，避免LangChain模板问题）
    const systemPrompt = PromptTemplateBuilder.buildBaseSystemPrompt(role, complexity, ragContext);

    // 5. 更新对话状态
    const conversationState = this.determineConversationState(complexity, taskAnalysis);
    this.conversationManager.updateState(conversationState);

    // 6. 准备消息格式（简化版本）
    const formattedMessages = [
      { role: 'system', content: systemPrompt }
    ];

    await runManager?.handleText(`提示词构建完成，角色: ${role}, 复杂度: ${complexity}`);

    // 7. 准备工具调用信息
    const availableTools = this.toolRegistry.getVercelAITools();
    const toolStats = this.toolRegistry.getToolStats();

    // 8. 记录对话历史
    await this.conversationManager.addUserMessage(input);

    return {
      output: formattedMessages,
      toolCalls: availableTools,
      ragContext,
      taskAnalysis,
      conversationState,
      toolStats,
      metadata: {
        role,
        complexity,
        sessionId: this.conversationManager.getMetadata().sessionId,
        messageCount: this.conversationManager.getMetadata().totalMessages
      }
    };
  }

  /**
   * 处理工具执行结果
   */
  async handleToolResult(toolName: string, result: any): Promise<void> {
    await this.conversationManager.addAIMessage(
      `工具 ${toolName} 执行完成: ${JSON.stringify(result)}`,
      { toolName, result }
    );
  }

  /**
   * 获取会话分析
   */
  getConversationAnalysis() {
    return this.conversationManager.analyzeConversationPattern();
  }

  /**
   * 导出会话数据
   */
  exportConversation() {
    return this.conversationManager.exportConversation();
  }

  /**
   * 清理会话
   */
  clearConversation(): void {
    this.conversationManager.clearHistory();
  }

  _chainType(): string {
    return 'task_chain';
  }

  // 私有方法

  private determineConversationState(
    complexity: TaskComplexity, 
    taskAnalysis: TaskAnalysis | null
  ): ConversationState {
    if (!taskAnalysis) {
      return ConversationState.TASK_EXECUTION;
    }

    switch (complexity) {
      case TaskComplexity.COMPLEX:
        return ConversationState.TASK_PLANNING;
      case TaskComplexity.MODERATE:
        return ConversationState.TASK_EXECUTION;
      default:
        return ConversationState.IDLE;
    }
  }
}

/**
 * 创建任务链实例
 */
export function createTaskChain(
  conversationManager: ConversationManager,
  options?: {
    defaultRole?: AgentRole;
    defaultComplexity?: TaskComplexity;
    enableRAG?: boolean;
    enablePlanning?: boolean;
  }
): TaskChain {
  return new TaskChain(conversationManager, {
    enableRAG: true,
    enablePlanning: true,
    ...options
  });
} 