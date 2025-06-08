// 定义指令类型
export interface Instruction {
  action: 'add' | 'complete' | 'delete' | 'list' | 'clear_completed' | 'clear_all';
  task?: string;
  id?: number;
  response?: string;
}

// 定义待办事项类型
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 定义执行结果类型
export interface ExecutionResult {
  success: boolean;
  message?: string;
  data?: Todo[] | Todo | boolean;
}

// 定义函数映射表类型
export type TodoFunction = (params?: string | number | undefined) => ExecutionResult | Todo[] | boolean | void;

// 指令映射器类
export class InstructionMapper {
  private functionMap: Map<string, TodoFunction>;
  
  constructor() {
    this.functionMap = new Map();
  }

  // 注册函数到映射表
  registerFunction(action: string, func: TodoFunction) {
    this.functionMap.set(action, func);
  }

  // 执行指令映射的函数
  executeInstruction(instruction: Instruction): ExecutionResult {
    const func = this.functionMap.get(instruction.action);
    
    if (!func) {
      console.warn(`未找到操作 "${instruction.action}" 对应的函数`);
      return { 
        success: false, 
        message: `不支持的操作: ${instruction.action}` 
      };
    }

    try {
      // 根据不同的操作类型传递不同的参数
      let result: ExecutionResult | Todo[] | boolean | void;
      
      switch (instruction.action) {
        case 'add':
          result = func(instruction.task);
          break;
        case 'complete':
        case 'delete':
          result = func(instruction.id || instruction.task);
          break;
        case 'list':
        case 'clear_completed':
        case 'clear_all':
          result = func();
          break;
        default:
          result = func();
      }

      // 标准化返回结果
      if (typeof result === 'object' && result !== null && 'success' in result) {
        return result as ExecutionResult;
      } else {
        return {
          success: true,
          message: `操作 "${instruction.action}" 执行成功`,
          data: result as Todo[] | Todo | boolean
        };
      }
    } catch (error) {
      console.error('执行指令时发生错误:', error);
      return { 
        success: false, 
        message: `执行操作 "${instruction.action}" 时发生错误` 
      };
    }
  }

  // 获取所有注册的函数
  getRegisteredActions(): string[] {
    return Array.from(this.functionMap.keys());
  }

  // 检查是否支持某个操作
  supportsAction(action: string): boolean {
    return this.functionMap.has(action);
  }
}

// 创建全局实例
export const instructionMapper = new InstructionMapper();

 