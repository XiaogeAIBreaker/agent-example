import { useCallback, useEffect } from 'react';
import { instructionMapper, Instruction, Todo, ExecutionResult, findTodoByText } from '../utils/instructionMapper';

interface UseInstructionMappingProps {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export function useInstructionMapping({ todos, setTodos }: UseInstructionMappingProps) {
  
  // 添加新任务
  const addTodo = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    const text = typeof params === 'string' ? params : String(params || '');
    
    if (text.trim() === '') {
      return { success: false, message: '任务内容不能为空' };
    }

    const existingTodo = todos.find(todo => 
      todo.text.toLowerCase() === text.toLowerCase()
    );
    
    if (existingTodo) {
      return { success: false, message: `任务 "${text}" 已经存在` };
    }

    const newTodo: Todo = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    
    setTodos(prev => [...prev, newTodo]);
    
    return { 
      success: true, 
      message: `已添加任务: "${newTodo.text}"`,
      data: newTodo
    };
  }, [todos, setTodos]);

  // 完成待办事项函数
  const completeTodoFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    if (!params) {
      return {
        success: false,
        message: '请指定要完成的任务'
      };
    }

    let targetTodo: Todo | undefined;
    
    if (typeof params === 'number') {
      targetTodo = todos.find(todo => todo.id === params);
    } else {
      const taskIdentifier = String(params);
      targetTodo = findTodoByText(todos, taskIdentifier);
    }

    if (!targetTodo) {
      return {
        success: false,
        message: `未找到任务: ${params}`
      };
    }

    if (targetTodo.completed) {
      return {
        success: false,
        message: `任务 "${targetTodo.text}" 已经完成了`
      };
    }

    const updatedTodos = todos.map(todo =>
      todo.id === targetTodo!.id ? { ...todo, completed: true } : todo
    );
    
    setTodos(updatedTodos);
    
    return {
      success: true,
      message: `已完成任务: ${targetTodo.text}`,
      data: { ...targetTodo, completed: true }
    };
  }, [todos, setTodos]);

  // 删除待办事项函数
  const deleteTodoFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    if (!params) {
      return {
        success: false,
        message: '请指定要删除的任务'
      };
    }

    let targetTodo: Todo | undefined;
    
    if (typeof params === 'number') {
      targetTodo = todos.find(todo => todo.id === params);
    } else {
      const taskIdentifier = String(params);
      targetTodo = findTodoByText(todos, taskIdentifier);
    }

    if (!targetTodo) {
      return {
        success: false,
        message: `未找到任务: ${params}`
      };
    }

    const updatedTodos = todos.filter(todo => todo.id !== targetTodo!.id);
    setTodos(updatedTodos);
    
    return {
      success: true,
      message: `已删除任务: ${targetTodo.text}`,
      data: targetTodo
    };
  }, [todos, setTodos]);

  // 列出所有待办事项函数
  const listTodosFunction = useCallback((): ExecutionResult => {
    const completedCount = todos.filter(todo => todo.completed).length;
    const pendingCount = todos.length - completedCount;
    
    return {
      success: true,
      message: `共有 ${todos.length} 个任务，其中 ${completedCount} 个已完成，${pendingCount} 个待完成`,
      data: todos
    };
  }, [todos]);

  // 清除已完成任务函数
  const clearCompletedFunction = useCallback((): ExecutionResult => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
      return {
        success: false,
        message: '没有已完成的任务需要清除'
      };
    }

    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos);
    
    return {
      success: true,
      message: `已清除 ${completedTodos.length} 个已完成的任务`,
      data: completedTodos
    };
  }, [todos, setTodos]);

  // 清除所有任务函数
  const clearAllFunction = useCallback((): ExecutionResult => {
    if (todos.length === 0) {
      return {
        success: false,
        message: '没有任务需要清除'
      };
    }

    const clearedCount = todos.length;
    setTodos([]);
    
    return {
      success: true,
      message: `已清除所有 ${clearedCount} 个任务`,
      data: todos
    };
  }, [todos, setTodos]);

  // === 新增多步任务函数 ===
  
  // 查询当前任务函数
  const queryCurrentTasksFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    const includeCompleted = typeof params === 'boolean' ? params : false;
    const uncompletedTasks = todos.filter(todo => !todo.completed);
    const completedTasks = todos.filter(todo => todo.completed);
    
    if (uncompletedTasks.length === 0 && completedTasks.length === 0) {
      return {
        success: true,
        message: '当前没有任何任务',
        data: []
      };
    }
    
    const tasksToShow = includeCompleted ? todos : uncompletedTasks;
    const taskList = tasksToShow.map(todo => 
      `${todo.id}: ${todo.text} ${todo.completed ? '✅' : '⏳'}`
    ).join('\n');
    
    return {
      success: true,
      message: `当前${includeCompleted ? '所有' : '未完成'}任务列表：\n${taskList}\n\n统计：未完成 ${uncompletedTasks.length} 个，已完成 ${completedTasks.length} 个`,
      data: tasksToShow
    };
  }, [todos]);

  // 完成所有任务函数
  const completeAllTasksFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    const confirmMessage = typeof params === 'string' ? params : undefined;
    const uncompletedTasks = todos.filter(todo => !todo.completed);
    
    if (uncompletedTasks.length === 0) {
      return {
        success: false,
        message: '没有未完成的任务需要完成'
      };
    }
    
    const updatedTodos = todos.map(todo => ({ ...todo, completed: true }));
    setTodos(updatedTodos);
    
    const taskList = uncompletedTasks.map(todo => `• ${todo.text}`).join('\n');
    
    return {
      success: true,
      message: `已完成所有 ${uncompletedTasks.length} 个任务！${confirmMessage ? '\n' + confirmMessage : ''}\n\n完成的任务：\n${taskList}`,
      data: uncompletedTasks
    };
  }, [todos, setTodos]);

  // 生成日报任务函数
  const generateDailyReportFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    const reportType = typeof params === 'string' ? params : 'daily';
    const today = new Date().toLocaleDateString('zh-CN');
    
    const completedToday = todos.filter(todo => todo.completed);
    const pendingTasks = todos.filter(todo => !todo.completed);
    
    const reportContent = `${reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '总结'}任务 - ${today}`;
    
    const newTodo: Todo = {
      id: Date.now(),
      text: reportContent,
      completed: false
    };
    
    setTodos(prev => [...prev, newTodo]);
    
    const summary = `生成${reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '总结'}任务成功！\n\n当前状态：\n• 已完成：${completedToday.length} 个任务\n• 待完成：${pendingTasks.length} 个任务`;
    
    return {
      success: true,
      message: summary,
      data: newTodo
    };
  }, [todos, setTodos]);

  // 任务摘要函数
  const taskSummaryFunction = useCallback((params?: string | number | boolean | undefined): ExecutionResult => {
    const detailed = typeof params === 'boolean' ? params : false;
    const completedTasks = todos.filter(todo => todo.completed);
    const pendingTasks = todos.filter(todo => !todo.completed);
    
    let summary = `📊 任务总览：\n• 总任务数：${todos.length}\n• 已完成：${completedTasks.length} 个\n• 待完成：${pendingTasks.length} 个`;
    
    if (detailed && todos.length > 0) {
      summary += '\n\n📝 详细列表：';
      
      if (pendingTasks.length > 0) {
        summary += '\n\n⏳ 待完成任务：';
        pendingTasks.forEach(todo => {
          summary += `\n• ${todo.text} (ID: ${todo.id})`;
        });
      }
      
      if (completedTasks.length > 0) {
        summary += '\n\n✅ 已完成任务：';
        completedTasks.forEach(todo => {
          summary += `\n• ${todo.text} (ID: ${todo.id})`;
        });
      }
    }
    
    if (todos.length > 0) {
      const completionRate = Math.round((completedTasks.length / todos.length) * 100);
      summary += `\n\n🎯 完成率：${completionRate}%`;
    }
    
    return {
      success: true,
      message: summary,
      data: {
        total: todos.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        completionRate: todos.length > 0 ? Math.round((completedTasks.length / todos.length) * 100) : 0
      }
    };
  }, [todos]);

  // 注册所有函数到映射器
  useEffect(() => {
    instructionMapper.registerFunction('add', addTodo);
    instructionMapper.registerFunction('complete', completeTodoFunction);
    instructionMapper.registerFunction('delete', deleteTodoFunction);
    instructionMapper.registerFunction('list', listTodosFunction);
    instructionMapper.registerFunction('clear_completed', clearCompletedFunction);
    instructionMapper.registerFunction('clear_all', clearAllFunction);
    
    // 注册新的多步任务函数
    instructionMapper.registerFunction('query_current', queryCurrentTasksFunction);
    instructionMapper.registerFunction('complete_all', completeAllTasksFunction);
    instructionMapper.registerFunction('generate_report', generateDailyReportFunction);
    instructionMapper.registerFunction('task_summary', taskSummaryFunction);
  }, [
    addTodo,
    completeTodoFunction,
    deleteTodoFunction,
    listTodosFunction,
    clearCompletedFunction,
    clearAllFunction,
    // 新增函数依赖
    queryCurrentTasksFunction,
    completeAllTasksFunction,
    generateDailyReportFunction,
    taskSummaryFunction
  ]);

  // 执行指令的主函数
  const executeInstruction = useCallback((instruction: Instruction): ExecutionResult => {
    console.log('执行指令:', instruction);
    const result = instructionMapper.executeInstruction(instruction);
    console.log('执行结果:', result);
    return result;
  }, []);

  // 获取支持的操作列表
  const getSupportedActions = useCallback((): string[] => {
    return instructionMapper.getRegisteredActions();
  }, []);

  return {
    executeInstruction,
    getSupportedActions,
    // 直接导出各个函数，以便组件可以直接调用
    addTodo,
    completeTodo: completeTodoFunction,
    deleteTodo: deleteTodoFunction,
    listTodos: listTodosFunction,
    clearCompleted: clearCompletedFunction,
    clearAll: clearAllFunction,
    // 导出新的多步任务函数
    queryCurrentTasks: queryCurrentTasksFunction,
    completeAllTasks: completeAllTasksFunction,
    generateDailyReport: generateDailyReportFunction,
    taskSummary: taskSummaryFunction
  };
} 