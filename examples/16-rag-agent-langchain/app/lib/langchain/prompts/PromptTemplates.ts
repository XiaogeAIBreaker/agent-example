/**
 * Prompt模板管理器
 * 
 * 这个模块负责管理AI代理的系统提示词模板，包括：
 * - 角色定义和复杂度级别的枚举
 * - 基于角色和复杂度的动态prompt构建
 * - RAG知识检索结果的集成
 * - Chain of Thought工作流程的指导
 * 
 * 主要特性：
 * - 支持多种代理角色（任务规划师、执行者、知识顾问等）
 * - 自适应任务复杂度处理
 * - 透明化思考过程展示
 * - 强制工具调用和结果总结
 */

/**
 * 系统角色定义
 * 
 * 定义AI代理可以扮演的不同角色，每个角色有特定的职责和行为模式：
 * - TASK_PLANNER: 擅长复杂任务的分解和规划
 * - TODO_EXECUTOR: 专注于具体任务的执行和管理
 * - RAG_ADVISOR: 基于检索知识提供个性化建议
 * - CONTEXT_MANAGER: 维护多轮对话的连贯性和上下文
 */
export enum AgentRole {
  TASK_PLANNER = 'task_planner',    // 任务规划师
  TODO_EXECUTOR = 'todo_executor',  // 任务执行者
  RAG_ADVISOR = 'rag_advisor',      // 知识顾问
  CONTEXT_MANAGER = 'context_manager' // 上下文管理者
}

/**
 * 任务复杂度级别
 * 
 * 根据任务的复杂程度分类，用于调整AI的处理策略：
 * - SIMPLE: 单一指令，直接执行
 * - MODERATE: 多步骤任务，需要顺序执行
 * - COMPLEX: 复杂任务，需要规划分解和协作
 */
export enum TaskComplexity {
  SIMPLE = 'simple',      // 简单任务 - 单一指令
  MODERATE = 'moderate',  // 中等复杂度 - 多步骤任务
  COMPLEX = 'complex'     // 复杂任务 - 需要规划和分解
}



/**
 * Prompt模板构建器
 * 
 * 这个类负责构建动态的系统提示词，集成多个组件：
 * - 基础角色和复杂度设置
 * - Chain of Thought工作流程指导
 * - RAG检索的知识库内容
 * - 工具调用和执行规范
 * - 强制性输出格式要求
 */
export class PromptTemplateBuilder {
  /**
   * 构建基础Chain of Thought系统提示词
   * 
   * 这是核心方法，用于生成完整的系统提示词，包含：
   * 1. 角色定义和行为要求
   * 2. 工作流程和执行顺序
   * 3. 标准回复格式模板
   * 4. 工具调用规范和示例
   * 5. RAG知识库上下文集成
   * 
   * @param role - AI代理的角色（规划师、执行者等）
   * @param complexity - 任务复杂度级别（简单、中等、复杂）
   * @param ragContext - RAG检索到的知识库内容（可选）
   * @returns 完整的系统提示词字符串
   */
  static buildBaseSystemPrompt(role: AgentRole, complexity: TaskComplexity, ragContext?: string): string {
    const basePrompt = `你是一个具备透明化思考能力的智能任务助手，拥有RAG知识检索和Few-shot学习能力。

**当前角色**: ${this.getRoleDescription(role)}
**任务复杂度**: ${this.getComplexityDescription(complexity)}

**关键行为要求：**
- 每次回复都必须包含完整的思考过程、执行过程和结果总结
- 在调用工具后，必须继续生成文本来总结执行结果
- 不能在工具调用后就停止回复，必须告知用户执行状态

**核心工作流程：**
1. **显示Prompt** - 首先输出当前使用的完整系统提示词
2. **思考分析** - 展示完整推理过程
3. **制定计划** - 基于思考制定具体执行方案  
4. **执行操作** - 实际调用工具完成任务（必须在此步骤真正执行）
5. **总结反馈** - 仅在工具执行完成后说明执行结果

**严格执行顺序：**
- 显示Prompt → 思考 → 计划 → 工具调用 → 结果总结
- 禁止在工具调用之前声称任务已完成
- 禁止跳过实际的工具执行步骤

**标准回复格式：**
📄 **当前Prompt：**
[输出完整的系统提示词内容，包括RAG检索到的知识库内容]

🧠 **思考过程：**
[详细分析用户请求、判断任务类型、制定解决方案]

📋 **执行计划：**
[基于思考结果，说明将要执行的具体操作，然后立即调用相应工具，并在工具执行完成后总结结果]

⚠️ **重要执行规则：**
1. **先思考后执行** - 展示分析过程，然后制定计划
2. **必须使用工具** - 根据用户请求调用对应的工具函数
3. **等待工具结果** - 在工具执行完成后才能总结结果
4. **禁止虚假完成** - 不能在未调用工具时声称任务已完成

**完整执行流程示例：**
用户："帮我mark一下：买菜、做饭"
1. 📄显示：输出当前完整的系统提示词（包括RAG内容）
2. 🧠思考：用户要添加两个任务
3. 📋计划：分别调用addTodo工具
4. 🔧执行：调用addTodo({task: "买菜"})和addTodo({task: "做饭"})  
5. ✅总结：**工具执行完成后，我必须输出总结，告知用户执行结果**

**关键提醒：工具调用完成后，必须继续输出文本总结执行结果！**

${this.getComplexitySpecificInstructions(complexity)}

可用工具：
- addTodo: 添加新任务，参数 {task: string}
- completeTodo: 完成任务，参数 {taskIdentifier: string}  
- deleteTodo: 删除任务，参数 {taskIdentifier: string}
- listTodos: 查看所有任务，无参数
- clearCompleted: 清理已完成任务，无参数
- clearAll: 清理所有任务，无参数

${ragContext ? `**知识库上下文：**\n${ragContext}` : ''}

**最终提醒：**
无论调用多少个工具，都必须在所有工具执行完成后，继续输出文本来总结结果！
这不是可选的，而是每次回复的必要组成部分！

**强制要求：工具调用后必须输出：**
"✅ **执行结果：** 
[详细说明工具执行的结果和当前状态]"`;

    return basePrompt.trim();
  }

  /**
   * 获取角色描述
   * 
   * 根据角色枚举返回人性化的角色描述，用于在系统提示词中说明AI的当前角色定位
   * 
   * @param role - 角色枚举值
   * @returns 角色的中文描述字符串
   */
  private static getRoleDescription(role: AgentRole): string {
    switch (role) {
      case AgentRole.TASK_PLANNER:
        return '任务规划师 - 专注于复杂任务的分解和规划';
      case AgentRole.TODO_EXECUTOR:
        return '任务执行者 - 专注于具体任务的添加、完成和管理';
      case AgentRole.RAG_ADVISOR:
        return '知识顾问 - 基于检索知识提供个性化建议';
      case AgentRole.CONTEXT_MANAGER:
        return '上下文管理者 - 维护多轮对话的连贯性';
      default:
        return '通用智能助手';
    }
  }

  /**
   * 获取复杂度描述
   * 
   * 根据复杂度枚举返回人性化的复杂度描述，帮助AI理解当前任务的处理要求
   * 
   * @param complexity - 复杂度枚举值
   * @returns 复杂度的中文描述字符串
   */
  private static getComplexityDescription(complexity: TaskComplexity): string {
    switch (complexity) {
      case TaskComplexity.SIMPLE:
        return '简单任务 - 单一指令执行';
      case TaskComplexity.MODERATE:
        return '中等复杂度 - 多步骤任务执行';
      case TaskComplexity.COMPLEX:
        return '复杂任务 - 需要规划分解和多轮协作';
      default:
        return '自适应复杂度';
    }
  }

  /**
   * 获取复杂度特定指令
   * 
   * 根据任务复杂度生成具体的处理指导，为不同复杂度的任务提供针对性的执行策略
   * 
   * @param complexity - 复杂度枚举值
   * @returns 针对该复杂度的具体处理指令
   */
  private static getComplexitySpecificInstructions(complexity: TaskComplexity): string {
    switch (complexity) {
      case TaskComplexity.SIMPLE:
        return `**简单任务处理要点：**
- 直接理解用户意图并执行
- 确保操作准确无误
- 提供简洁明确的反馈`;

      case TaskComplexity.MODERATE:
        return `**中等复杂度任务处理要点：**
- 将任务分解为明确的步骤
- 按逻辑顺序执行各个步骤
- 在每个关键节点提供进度反馈`;

      case TaskComplexity.COMPLEX:
        return `**复杂任务处理要点：**
- 进行全面的任务分析和规划
- 识别依赖关系和优先级
- 创建结构化的任务层次
- 考虑时间线和资源分配
- 提供可执行的分步计划`;

      default:
        return '';
    }
  }
}

 