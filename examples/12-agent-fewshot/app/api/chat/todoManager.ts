interface Todo {
  id: string;
  task: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

class TodoManager {
  private todos: Todo[] = [];
  private nextId = 1;

  addTodo(task: string): { success: boolean; message: string; todo?: Todo } {
    const todo: Todo = {
      id: this.nextId.toString(),
      task: task.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    this.todos.push(todo);
    this.nextId++;
    
    return {
      success: true,
      message: `✅ 任务 "${task}" 已添加 (ID: ${todo.id})`,
      todo
    };
  }

  completeTodo(taskIdentifier: string): { success: boolean; message: string; todo?: Todo } {
    // 尝试通过ID找到任务
    let todo = this.todos.find(t => t.id === taskIdentifier);
    
    // 如果没找到，尝试通过任务内容模糊匹配
    if (!todo) {
      todo = this.todos.find(t => 
        t.task.toLowerCase().includes(taskIdentifier.toLowerCase()) ||
        taskIdentifier.toLowerCase().includes(t.task.toLowerCase())
      );
    }
    
    if (!todo) {
      return {
        success: false,
        message: `❌ 未找到任务: "${taskIdentifier}"`
      };
    }
    
    if (todo.completed) {
      return {
        success: false,
        message: `⚠️ 任务 "${todo.task}" 已经完成了`
      };
    }
    
    todo.completed = true;
    todo.completedAt = new Date();
    
    return {
      success: true,
      message: `✅ 任务 "${todo.task}" 已完成`,
      todo
    };
  }

  deleteTodo(taskIdentifier: string): { success: boolean; message: string; todo?: Todo } {
    const index = this.todos.findIndex(t => 
      t.id === taskIdentifier ||
      t.task.toLowerCase().includes(taskIdentifier.toLowerCase()) ||
      taskIdentifier.toLowerCase().includes(t.task.toLowerCase())
    );
    
    if (index === -1) {
      return {
        success: false,
        message: `❌ 未找到任务: "${taskIdentifier}"`
      };
    }
    
    const deletedTodo = this.todos[index];
    this.todos.splice(index, 1);
    
    return {
      success: true,
      message: `🗑️ 任务 "${deletedTodo.task}" 已删除`,
      todo: deletedTodo
    };
  }

  listTodos(): { success: boolean; message: string; todos: Todo[] } {
    if (this.todos.length === 0) {
      return {
        success: true,
        message: "📋 当前没有任务",
        todos: []
      };
    }
    
    const pendingTodos = this.todos.filter(t => !t.completed);
    const completedTodos = this.todos.filter(t => t.completed);
    
    let message = "📋 当前任务列表：\n\n";
    
    if (pendingTodos.length > 0) {
      message += "**未完成任务：**\n";
      pendingTodos.forEach((todo, index) => {
        message += `${index + 1}. ${todo.task} (ID: ${todo.id})\n`;
      });
      message += "\n";
    }
    
    if (completedTodos.length > 0) {
      message += "**已完成任务：**\n";
      completedTodos.forEach((todo, index) => {
        message += `${index + 1}. ✅ ${todo.task} (ID: ${todo.id})\n`;
      });
    }
    
    return {
      success: true,
      message: message.trim(),
      todos: this.todos
    };
  }

  clearCompleted(): { success: boolean; message: string; count: number } {
    const completedCount = this.todos.filter(t => t.completed).length;
    
    if (completedCount === 0) {
      return {
        success: true,
        message: "📝 没有已完成的任务需要清理",
        count: 0
      };
    }
    
    this.todos = this.todos.filter(t => !t.completed);
    
    return {
      success: true,
      message: `🧹 已清理 ${completedCount} 个已完成的任务`,
      count: completedCount
    };
  }

  clearAll(): { success: boolean; message: string; count: number } {
    const totalCount = this.todos.length;
    
    if (totalCount === 0) {
      return {
        success: true,
        message: "📝 没有任务需要清理",
        count: 0
      };
    }
    
    this.todos = [];
    this.nextId = 1;
    
    return {
      success: true,
      message: `🧹 已清理所有 ${totalCount} 个任务`,
      count: totalCount
    };
  }

  getStats(): {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  } {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  }
}

// 使用单例模式确保所有会话共享同一个TodoManager实例
let todoManagerInstance: TodoManager | null = null;

export function getTodoManager(): TodoManager {
  if (!todoManagerInstance) {
    todoManagerInstance = new TodoManager();
  }
  return todoManagerInstance;
}

export type { Todo }; 