import { AgentRole, TaskComplexity } from '../prompts/PromptTemplates';
import { ConversationState, TaskContext } from '../memory/ConversationManager';

/**
 * 任务类型
 */
export enum TaskType {
  SIMPLE_TODO = 'simple_todo',
  PROJECT_MANAGEMENT = 'project_management',
  EVENT_PLANNING = 'event_planning',
  LEARNING_CURRICULUM = 'learning_curriculum',
  CONTENT_CREATION = 'content_creation',
  RESEARCH = 'research',
  WORKFLOW_AUTOMATION = 'workflow_automation'
}

/**
 * 任务阶段
 */
export enum TaskPhase {
  ANALYSIS = 'analysis',
  PLANNING = 'planning', 
  EXECUTION = 'execution',
  REVIEW = 'review',
  COMPLETION = 'completion'
}

/**
 * 任务优先级矩阵
 */
export interface TaskPriority {
  urgency: 'low' | 'medium' | 'high';
  importance: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 执行计划步骤
 */
export interface PlanStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  dependencies: string[];
  phase: TaskPhase;
  priority: TaskPriority;
  resources: string[];
  deliverables: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

/**
 * 任务执行计划
 */
export interface ExecutionPlan {
  taskId: string;
  title: string;
  description: string;
  type: TaskType;
  complexity: TaskComplexity;
  totalEstimatedTime: string;
  phases: TaskPhase[];
  steps: PlanStep[];
  criticalPath: string[];
  risks: string[];
  successCriteria: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 任务分析结果
 */
export interface TaskAnalysis {
  taskType: TaskType;
  complexity: TaskComplexity;
  requiredRole: AgentRole;
  suggestedApproach: string;
  keyComponents: string[];
  potentialChallenges: string[];
  recommendedTools: string[];
  estimatedDuration: string;
}

/**
 * LangChain任务规划器
 */
export class TaskPlanner {
  private planCounter = 1;

  /**
   * 分析任务特性
   */
  analyzeTask(taskDescription: string): TaskAnalysis {
    const taskLower = taskDescription.toLowerCase();
    
    // 任务类型识别
    const taskType = this.identifyTaskType(taskLower);
    
    // 复杂度评估
    const complexity = this.assessComplexity(taskLower, taskType);
    
    // 角色推荐
    const requiredRole = this.recommendRole(complexity, taskType);
    
    // 组件分析
    const keyComponents = this.extractKeyComponents(taskLower, taskType);
    
    // 挑战识别
    const potentialChallenges = this.identifyPotentialChallenges(taskType, complexity);
    
    // 工具推荐
    const recommendedTools = this.recommendTools(taskType);
    
    // 时间估算
    const estimatedDuration = this.estimateDuration(complexity, keyComponents.length);

    return {
      taskType,
      complexity,
      requiredRole,
      suggestedApproach: this.getSuggestedApproach(taskType, complexity),
      keyComponents,
      potentialChallenges,
      recommendedTools,
      estimatedDuration
    };
  }

  /**
   * 创建执行计划
   */
  createExecutionPlan(taskDescription: string, analysis?: TaskAnalysis): ExecutionPlan {
    const taskAnalysis = analysis || this.analyzeTask(taskDescription);
    const taskId = `task_${this.planCounter++}_${Date.now()}`;
    
    const steps = this.generatePlanSteps(taskDescription, taskAnalysis);
    const phases = this.extractPhases(steps);
    const criticalPath = this.calculateCriticalPath(steps);
    const risks = this.identifyRisks(taskAnalysis);
    const successCriteria = this.defineSuccessCriteria(taskDescription, taskAnalysis);
    
    return {
      taskId,
      title: taskDescription,
      description: `基于${taskAnalysis.complexity}复杂度的${taskAnalysis.taskType}任务执行计划`,
      type: taskAnalysis.taskType,
      complexity: taskAnalysis.complexity,
      totalEstimatedTime: taskAnalysis.estimatedDuration,
      phases,
      steps,
      criticalPath,
      risks,
      successCriteria,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 生成任务上下文
   */
  generateTaskContext(plan: ExecutionPlan): TaskContext {
    return {
      currentTask: plan.title,
      taskSteps: plan.steps.map(s => s.title),
      completedSteps: plan.steps.filter(s => s.status === 'completed').map(s => s.title),
      pendingSteps: plan.steps.filter(s => s.status === 'pending').map(s => s.title),
      dependencies: plan.criticalPath,
      priority: this.calculateOverallPriority(plan.steps),
      estimatedTime: plan.totalEstimatedTime,
      resources: Array.from(new Set(plan.steps.flatMap(s => s.resources)))
    };
  }

  /**
   * 更新计划状态
   */
  updatePlanProgress(plan: ExecutionPlan, stepId: string, newStatus: PlanStep['status']): ExecutionPlan {
    const updatedSteps = plan.steps.map(step => 
      step.id === stepId ? { ...step, status: newStatus } : step
    );

    return {
      ...plan,
      steps: updatedSteps,
      updatedAt: new Date()
    };
  }

  /**
   * 获取下一步建议
   */
  getNextStepRecommendation(plan: ExecutionPlan): {
    nextSteps: PlanStep[];
    blockedSteps: PlanStep[];
    completionPercentage: number;
    estimatedRemainingTime: string;
  } {
    const availableSteps = plan.steps.filter(step => {
      if (step.status !== 'pending') return false;
      
      // 检查依赖是否满足
      return step.dependencies.every(depId => 
        plan.steps.find(s => s.id === depId)?.status === 'completed'
      );
    });

    const blockedSteps = plan.steps.filter(step => {
      if (step.status !== 'pending') return false;
      
      return step.dependencies.some(depId => 
        plan.steps.find(s => s.id === depId)?.status !== 'completed'
      );
    });

    const completedCount = plan.steps.filter(s => s.status === 'completed').length;
    const completionPercentage = Math.round((completedCount / plan.steps.length) * 100);

    const remainingSteps = plan.steps.filter(s => s.status !== 'completed');
    const estimatedRemainingTime = this.calculateRemainingTime(remainingSteps);

    return {
      nextSteps: availableSteps.sort((a, b) => this.comparePriority(a.priority, b.priority)),
      blockedSteps,
      completionPercentage,
      estimatedRemainingTime
    };
  }

  // 私有方法实现

  private identifyTaskType(taskLower: string): TaskType {
    if (taskLower.includes('发布会') || taskLower.includes('活动') || taskLower.includes('聚会')) {
      return TaskType.EVENT_PLANNING;
    }
    if (taskLower.includes('项目') || taskLower.includes('开发') || taskLower.includes('管理')) {
      return TaskType.PROJECT_MANAGEMENT;
    }
    if (taskLower.includes('学习') || taskLower.includes('培训') || taskLower.includes('课程')) {
      return TaskType.LEARNING_CURRICULUM;
    }
    if (taskLower.includes('写作') || taskLower.includes('内容') || taskLower.includes('文章')) {
      return TaskType.CONTENT_CREATION;
    }
    if (taskLower.includes('研究') || taskLower.includes('调研') || taskLower.includes('分析')) {
      return TaskType.RESEARCH;
    }
    if (taskLower.includes('流程') || taskLower.includes('自动化') || taskLower.includes('优化')) {
      return TaskType.WORKFLOW_AUTOMATION;
    }
    return TaskType.SIMPLE_TODO;
  }

  private assessComplexity(taskLower: string, taskType: TaskType): TaskComplexity {
    let complexityScore = 0;
    
    // 基于任务类型的基础分数
    const typeScores = {
      [TaskType.SIMPLE_TODO]: 1,
      [TaskType.CONTENT_CREATION]: 2,
      [TaskType.LEARNING_CURRICULUM]: 3,
      [TaskType.EVENT_PLANNING]: 4,
      [TaskType.RESEARCH]: 4,
      [TaskType.WORKFLOW_AUTOMATION]: 5,
      [TaskType.PROJECT_MANAGEMENT]: 5
    };
    
    complexityScore += typeScores[taskType];
    
    // 关键词影响
    const complexityKeywords = {
      '多个': 1, '复杂': 2, '系统': 2, '完整': 1, '全面': 2,
      '团队': 1, '协作': 1, '管理': 1, '规划': 1, '策略': 2
    };
    
    Object.entries(complexityKeywords).forEach(([keyword, score]) => {
      if (taskLower.includes(keyword)) {
        complexityScore += score;
      }
    });
    
    if (complexityScore <= 2) return TaskComplexity.SIMPLE;
    if (complexityScore <= 5) return TaskComplexity.MODERATE;
    return TaskComplexity.COMPLEX;
  }

  private recommendRole(complexity: TaskComplexity, taskType: TaskType): AgentRole {
    if (complexity === TaskComplexity.COMPLEX) {
      return AgentRole.TASK_PLANNER;
    }
    if (taskType === TaskType.RESEARCH) {
      return AgentRole.RAG_ADVISOR;
    }
    return AgentRole.TODO_EXECUTOR;
  }

  private extractKeyComponents(taskLower: string, taskType: TaskType): string[] {
    const componentMap = {
      [TaskType.EVENT_PLANNING]: ['策划', '场地', '邀请', '宣传', '执行'],
      [TaskType.PROJECT_MANAGEMENT]: ['需求', '设计', '开发', '测试', '部署'],
      [TaskType.LEARNING_CURRICULUM]: ['计划', '资料', '学习', '练习', '总结'],
      [TaskType.CONTENT_CREATION]: ['大纲', '素材', '写作', '编辑', '发布'],
      [TaskType.RESEARCH]: ['文献', '数据', '分析', '结论', '报告'],
      [TaskType.WORKFLOW_AUTOMATION]: ['流程', '工具', '配置', '测试', '部署'],
      [TaskType.SIMPLE_TODO]: ['执行']
    };
    
    return componentMap[taskType] || ['执行'];
  }

  private identifyPotentialChallenges(taskType: TaskType, complexity: TaskComplexity): string[] {
    const challenges = [];
    
    if (complexity === TaskComplexity.COMPLEX) {
      challenges.push('需要详细规划和分解', '可能存在依赖关系', '资源协调挑战');
    }
    
    const typeChallenges = {
      [TaskType.EVENT_PLANNING]: ['时间协调', '预算控制', '应急预案'],
      [TaskType.PROJECT_MANAGEMENT]: ['技术难点', '进度控制', '质量保证'],
      [TaskType.LEARNING_CURRICULUM]: ['知识体系', '学习进度', '实践机会'],
      [TaskType.CONTENT_CREATION]: ['创意构思', '内容质量', '受众反馈'],
      [TaskType.RESEARCH]: ['信息获取', '数据准确性', '客观分析'],
      [TaskType.WORKFLOW_AUTOMATION]: ['系统集成', '错误处理', '用户培训']
    };
    
    challenges.push(...(typeChallenges[taskType] || []));
    return challenges;
  }

  private recommendTools(taskType: TaskType): string[] {
    const toolMap = {
      [TaskType.EVENT_PLANNING]: ['addTodo', 'planComplexTask', 'listTodos'],
      [TaskType.PROJECT_MANAGEMENT]: ['planComplexTask', 'addTodo', 'completeTodo'],
      [TaskType.LEARNING_CURRICULUM]: ['addTodo', 'planComplexTask'],
      [TaskType.CONTENT_CREATION]: ['addTodo', 'listTodos'],
      [TaskType.RESEARCH]: ['addTodo', 'listTodos'],
      [TaskType.WORKFLOW_AUTOMATION]: ['planComplexTask', 'addTodo'],
      [TaskType.SIMPLE_TODO]: ['addTodo', 'completeTodo', 'deleteTodo']
    };
    
    return toolMap[taskType] || ['addTodo'];
  }

  private estimateDuration(complexity: TaskComplexity, componentCount: number): string {
    const baseHours = {
      [TaskComplexity.SIMPLE]: 1,
      [TaskComplexity.MODERATE]: 4,
      [TaskComplexity.COMPLEX]: 12
    };
    
    const estimatedHours = baseHours[complexity] * Math.max(componentCount, 1);
    
    if (estimatedHours < 1) return '1小时内';
    if (estimatedHours < 8) return `约${estimatedHours}小时`;
    if (estimatedHours < 40) return `约${Math.round(estimatedHours / 8)}天`;
    return `约${Math.round(estimatedHours / 40)}周`;
  }

  private getSuggestedApproach(taskType: TaskType, complexity: TaskComplexity): string {
    if (complexity === TaskComplexity.SIMPLE) {
      return '直接执行，一步到位';
    }
    
    const approaches = {
      [TaskType.EVENT_PLANNING]: '按时间线分阶段规划，重点关注关键节点',
      [TaskType.PROJECT_MANAGEMENT]: '采用敏捷方法，迭代开发和持续集成',
      [TaskType.LEARNING_CURRICULUM]: '循序渐进，理论与实践相结合',
      [TaskType.CONTENT_CREATION]: '先构思大纲，再逐步完善内容',
      [TaskType.RESEARCH]: '系统性调研，多角度验证信息',
      [TaskType.WORKFLOW_AUTOMATION]: '渐进式自动化，先手动后自动'
    };
    
    return approaches[taskType] || '分步骤执行，逐个完成';
  }

  private generatePlanSteps(taskDescription: string, analysis: TaskAnalysis): PlanStep[] {
    // 这里可以实现更复杂的步骤生成逻辑
    return analysis.keyComponents.map((component, index) => ({
      id: `step_${index + 1}`,
      title: `${component}阶段`,
      description: `完成${taskDescription}的${component}相关工作`,
      estimatedTime: '2-4小时',
      dependencies: index > 0 ? [`step_${index}`] : [],
      phase: this.mapComponentToPhase(component),
      priority: {
        urgency: 'medium',
        importance: 'high',
        priority: 'medium'
      } as TaskPriority,
      resources: analysis.recommendedTools,
      deliverables: [`${component}完成确认`],
      status: 'pending'
    }));
  }

  private mapComponentToPhase(component: string): TaskPhase {
    if (component.includes('策划') || component.includes('计划')) return TaskPhase.PLANNING;
    if (component.includes('执行') || component.includes('开发')) return TaskPhase.EXECUTION;
    if (component.includes('总结') || component.includes('报告')) return TaskPhase.REVIEW;
    return TaskPhase.EXECUTION;
  }

  private extractPhases(steps: PlanStep[]): TaskPhase[] {
    const phases = new Set(steps.map(s => s.phase));
    return Array.from(phases);
  }

  private calculateCriticalPath(steps: PlanStep[]): string[] {
    // 简化的关键路径计算
    return steps.filter(s => s.dependencies.length > 0 || s.priority.priority === 'critical').map(s => s.id);
  }

  private identifyRisks(analysis: TaskAnalysis): string[] {
    return analysis.potentialChallenges.map(challenge => `风险: ${challenge}`);
  }

  private defineSuccessCriteria(taskDescription: string, analysis: TaskAnalysis): string[] {
    return [
      `${taskDescription}按期完成`,
      `所有关键组件已实现`,
      `质量符合预期标准`,
      `相关干系人满意度达标`
    ];
  }

  private calculateOverallPriority(steps: PlanStep[]): 'low' | 'medium' | 'high' {
    const priorities = steps.map(s => s.priority.priority);
    if (priorities.includes('critical') || priorities.filter(p => p === 'high').length > steps.length / 2) {
      return 'high';
    }
    if (priorities.filter(p => p === 'medium').length > steps.length / 2) {
      return 'medium';
    }
    return 'low';
  }

  private calculateRemainingTime(remainingSteps: PlanStep[]): string {
    if (remainingSteps.length === 0) return '已完成';
    return `预计还需${remainingSteps.length * 2}-${remainingSteps.length * 4}小时`;
  }

  private comparePriority(a: TaskPriority, b: TaskPriority): number {
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }
}

// 单例导出
let taskPlannerInstance: TaskPlanner | null = null;

export function getTaskPlanner(): TaskPlanner {
  if (!taskPlannerInstance) {
    taskPlannerInstance = new TaskPlanner();
  }
  return taskPlannerInstance;
} 