export type Instruction = { 
  action: string; 
  task?: string; 
  response?: string;
};

export type ExecutionResult = { 
  success: boolean; 
  message: string; 
};

// 简单的内存存储
let todos: string[] = [];

export function execute(instruction: Instruction): ExecutionResult {
  const { action, task } = instruction;
  
  if (action === 'add' && task) {
    todos.push(task);
    return { success: true, message: `已添加任务：${task}` };
  } else if (action === 'list') {
    if (todos.length === 0) {
      return { success: true, message: '当前没有任务' };
    }
    return { success: true, message: `当前任务：\n${todos.map((todo, index) => `${index + 1}. ${todo}`).join('\n')}` };
  } else if (action === 'clear') {
    const count = todos.length;
    todos = [];
    return { success: true, message: `已清空 ${count} 个任务` };
  } else {
    return { success: false, message: '未知操作或缺少参数' };
  }
}

export function parseInstruction(message: string): Instruction | null {
  // 寻找 JSON 代码块
  const match = message.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  
  // 如果没有找到代码块，尝试寻找普通的 JSON 对象
  const jsonMatch = message.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  
  return null;
}

// 获取当前任务列表（用于组件显示）
export function getTodos(): string[] {
  return [...todos];
}

// 直接添加任务（供UI使用）
export function addTodo(task: string): ExecutionResult {
  if (task.trim()) {
    todos.push(task.trim());
    return { success: true, message: `已添加任务：${task}` };
  }
  return { success: false, message: '任务内容不能为空' };
}

// 直接清空任务（供UI使用）
export function clearTodos(): ExecutionResult {
  const count = todos.length;
  todos = [];
  return { success: true, message: `已清空 ${count} 个任务` };
} 