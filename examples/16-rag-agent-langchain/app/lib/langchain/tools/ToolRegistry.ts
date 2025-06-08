import { z } from 'zod';
import { StructuredTool } from 'langchain/tools';
import { getTodoManager } from '../../../api/chat/todoManager';

/**
 * 工具执行结果
 */
export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  metadata?: Record<string, any>;
}

/**
 * 工具类别
 */
export enum ToolCategory {
  TODO_MANAGEMENT = 'todo_management',
  DATA_RETRIEVAL = 'data_retrieval',
  PLANNING = 'planning',
  ANALYSIS = 'analysis'
}

// 类型推断
type TodoManagerType = ReturnType<typeof getTodoManager>;

/**
 * Todo添加工具
 */
export class AddTodoTool extends StructuredTool {
  name = "addTodo";
  description = "添加新的待办任务";
  schema = z.object({
    task: z.string().describe("要添加的任务内容")
  });

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call({ task }: { task: string }): Promise<string> {
    console.log(`🔧 执行工具: addTodo, 参数: ${task}`);
    const result = this.todoManager.addTodo(task);
    console.log(`📝 AddTodo结果:`, result);
    return result.message;
  }
}

/**
 * Todo完成工具
 */
export class CompleteTodoTool extends StructuredTool {
  name = "completeTodo";
  description = "标记待办任务为已完成";
  schema = z.object({
    taskIdentifier: z.string().describe("任务ID或任务描述")
  });

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call({ taskIdentifier }: { taskIdentifier: string }): Promise<string> {
    console.log(`🔧 执行工具: completeTodo, 参数: ${taskIdentifier}`);
    const result = this.todoManager.completeTodo(taskIdentifier);
    console.log(`✅ CompleteTodo结果:`, result);
    return result.message;
  }
}

/**
 * Todo删除工具
 */
export class DeleteTodoTool extends StructuredTool {
  name = "deleteTodo";
  description = "删除待办任务";
  schema = z.object({
    taskIdentifier: z.string().describe("任务ID或任务描述")
  });

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call({ taskIdentifier }: { taskIdentifier: string }): Promise<string> {
    console.log(`🔧 执行工具: deleteTodo, 参数: ${taskIdentifier}`);
    const result = this.todoManager.deleteTodo(taskIdentifier);
    console.log(`🗑️ DeleteTodo结果:`, result);
    return result.message;
  }
}

/**
 * Todo列表查看工具
 */
export class ListTodosTool extends StructuredTool {
  name = "listTodos";
  description = "查看所有待办任务";
  schema = z.object({});

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call(): Promise<string> {
    console.log(`🔧 执行工具: listTodos`);
    const result = this.todoManager.listTodos();
    console.log(`📋 ListTodos结果:`, result);
    return result.message;
  }
}

/**
 * 清理已完成任务工具
 */
export class ClearCompletedTool extends StructuredTool {
  name = "clearCompleted";
  description = "清理所有已完成的任务";
  schema = z.object({});

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call(): Promise<string> {
    console.log(`🔧 执行工具: clearCompleted`);
    const result = this.todoManager.clearCompleted();
    console.log(`🧹 ClearCompleted结果:`, result);
    return result.message;
  }
}

/**
 * 清理所有任务工具
 */
export class ClearAllTool extends StructuredTool {
  name = "clearAll";
  description = "清理所有任务";
  schema = z.object({});

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call(): Promise<string> {
    console.log(`🔧 执行工具: clearAll`);
    const result = this.todoManager.clearAll();
    console.log(`🧹 ClearAll结果:`, result);
    return result.message;
  }
}

/**
 * 任务规划工具
 */
export class TaskPlannerTool extends StructuredTool {
  name = "planComplexTask";
  description = "为复杂任务制定详细规划，分解为多个子任务";
  schema = z.object({
    taskDescription: z.string().describe("复杂任务的描述"),
    deadline: z.string().optional().describe("任务截止时间"),
    priority: z.enum(['low', 'medium', 'high']).optional().describe("任务优先级")
  });

  private todoManager: TodoManagerType;

  constructor() {
    super();
    this.todoManager = getTodoManager();
  }

  async _call({ taskDescription, deadline, priority = 'medium' }: { 
    taskDescription: string; 
    deadline?: string; 
    priority?: 'low' | 'medium' | 'high';
  }): Promise<string> {
    console.log(`🔧 执行工具: planComplexTask, 参数: ${taskDescription}`);
    
    // 简单的任务分解逻辑（实际项目中可以使用更复杂的算法）
    const subtasks = this.decompoiseTask(taskDescription);
    const results: string[] = [];
    
    for (const subtask of subtasks) {
      const taskTitle = deadline 
        ? `${subtask} (截止: ${deadline}, 优先级: ${priority})`
        : `${subtask} (优先级: ${priority})`;
      
      const result = this.todoManager.addTodo(taskTitle);
      if (result.success) {
        results.push(`✅ 已添加: ${subtask}`);
      } else {
        results.push(`❌ 添加失败: ${subtask}`);
      }
    }

    const summary = `📋 复杂任务分解完成！\n原任务: ${taskDescription}\n分解为 ${subtasks.length} 个子任务:\n${results.join('\n')}`;
    console.log(`📋 TaskPlanner结果:`, summary);
    return summary;
  }

  private decompoiseTask(taskDescription: string): string[] {
    // 基于关键词的简单任务分解
    const taskLower = taskDescription.toLowerCase();
    
    if (taskLower.includes('发布会') || taskLower.includes('产品发布')) {
      return [
        '制定发布会策划方案',
        '确定发布会时间和地点',
        '准备产品演示材料',
        '邀请嘉宾和媒体',
        '安排现场设备和技术支持',
        '准备发布会宣传材料',
        '排练发布会流程',
        '准备问答环节',
        '安排发布会直播',
        '准备发布会后续宣传'
      ];
    } else if (taskLower.includes('项目') || taskLower.includes('开发')) {
      return [
        '项目需求分析',
        '技术方案设计',
        '任务分工安排',
        '开发环境搭建',
        '核心功能开发',
        '功能测试验证',
        '文档编写',
        '代码审查',
        '部署上线准备',
        '项目总结'
      ];
    } else if (taskLower.includes('学习') || taskLower.includes('培训')) {
      return [
        '制定学习计划',
        '收集学习资料',
        '基础知识学习',
        '实践练习',
        '难点攻克',
        '知识总结',
        '经验分享',
        '持续改进'
      ];
    } else if (taskLower.includes('活动') || taskLower.includes('聚会')) {
      return [
        '确定活动主题和目标',
        '制定活动预算',
        '选择活动场地',
        '邀请参与人员',
        '准备活动物料',
        '安排活动流程',
        '现场布置',
        '活动执行',
        '活动总结'
      ];
    } else {
      // 通用任务分解
      return [
        `${taskDescription} - 前期准备`,
        `${taskDescription} - 具体执行`,
        `${taskDescription} - 验收总结`
      ];
    }
  }
}

/**
 * 工具注册表
 */
export class ToolRegistry {
  private tools: Map<string, StructuredTool> = new Map();
  private categories: Map<ToolCategory, string[]> = new Map();

  constructor() {
    this.initializeTools();
  }

  /**
   * 初始化所有工具
   */
  private initializeTools(): void {
    // Todo管理工具
    const todoTools = [
      new AddTodoTool(),
      new CompleteTodoTool(),
      new DeleteTodoTool(),
      new ListTodosTool(),
      new ClearCompletedTool(),
      new ClearAllTool()
    ];

    // 规划工具
    const planningTools = [
      new TaskPlannerTool()
    ];

    // 注册工具
    [...todoTools, ...planningTools].forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // 设置分类
    this.categories.set(ToolCategory.TODO_MANAGEMENT, todoTools.map(t => t.name));
    this.categories.set(ToolCategory.PLANNING, planningTools.map(t => t.name));
  }

  /**
   * 获取工具
   */
  getTool(name: string): StructuredTool | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): StructuredTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按类别获取工具
   */
  getToolsByCategory(category: ToolCategory): StructuredTool[] {
    const toolNames = this.categories.get(category) || [];
    return toolNames.map(name => this.tools.get(name)).filter(Boolean) as StructuredTool[];
  }

  /**
   * 获取工具名称列表
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 获取工具描述
   */
  getToolDescription(name: string): string | undefined {
    const tool = this.tools.get(name);
    return tool?.description;
  }

  /**
   * 转换为@vercel/ai-sdk格式的工具
   */
  getVercelAITools(): Record<string, any> {
    const vercelTools: Record<string, any> = {};
    
    this.tools.forEach((tool, name) => {
      vercelTools[name] = {
        description: tool.description,
        parameters: tool.schema,
        execute: async (params: any) => {
          return await tool.call(params);
        }
      };
    });

    return vercelTools;
  }

  /**
   * 获取工具统计信息
   */
  getToolStats(): {
    totalTools: number;
    categoryCounts: Record<string, number>;
    toolsList: Array<{ name: string; category: string; description: string }>;
  } {
    const categoryCounts: Record<string, number> = {};
    const toolsList: Array<{ name: string; category: string; description: string }> = [];

    // 统计各类别工具数量
    Array.from(this.categories.entries()).forEach(([category, tools]) => {
      categoryCounts[category] = tools.length;
    });

    // 构建工具列表
    this.tools.forEach((tool, name) => {
      let category = 'unknown';
      for (const [cat, tools] of Array.from(this.categories.entries())) {
        if (tools.includes(name)) {
          category = cat;
          break;
        }
      }
      
      toolsList.push({
        name,
        category,
        description: tool.description
      });
    });

    return {
      totalTools: this.tools.size,
      categoryCounts,
      toolsList
    };
  }
}

// 单例模式导出
let toolRegistryInstance: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
  if (!toolRegistryInstance) {
    toolRegistryInstance = new ToolRegistry();
  }
  return toolRegistryInstance;
} 