import { useCallback, useEffect } from 'react';
import { getTodoManager } from '../api/chat/todoManager';
import type { Todo as BackendTodo } from '../api/chat/todoManager';
import { Todo, ExecutionResult, Instruction } from '../utils/instructionMapper';

interface UseInstructionMappingProps {
  todos: BackendTodo[];
  setTodos: React.Dispatch<React.SetStateAction<BackendTodo[]>>;
}

export function useInstructionMapping({ setTodos }: UseInstructionMappingProps) {
  // 获取后端TodoManager实例
  const todoManager = getTodoManager();

  // 转换Backend Todo到Frontend Todo
  const convertBackendToFrontend = (backendTodo: BackendTodo): Todo => ({
    id: parseInt(backendTodo.id),
    text: backendTodo.task,
    completed: backendTodo.completed
  });

  // 添加新任务
  const addTodo = useCallback((params?: string | number | undefined): ExecutionResult => {
    const text = typeof params === 'string' ? params : String(params || '');
    
    if (text.trim() === '') {
      return { success: false, message: '任务内容不能为空' };
    }

    console.log('🔧 [addTodo] 开始添加任务:', text);
    // 使用TodoManager添加任务
    const result = todoManager.addTodo(text.trim());
    console.log('🔧 [addTodo] TodoManager结果:', result);
    
    // 同步状态
    if (result.success) {
      // 直接更新状态，避免调用syncFromBackend
      const listResult = todoManager.listTodos();
      console.log('🔧 [addTodo] 获取最新列表:', listResult);
      
      if (listResult.success) {
        const newTodos = [...listResult.todos];
        console.log('🔧 [addTodo] 准备设置新状态，todos:', newTodos.map(t => ({ id: t.id, task: t.task, completed: t.completed })));
        setTodos(newTodos);
        console.log('🔧 [addTodo] setTodos完成');
      }
      
      return {
        success: result.success,
        message: result.message,
        data: result.todo ? convertBackendToFrontend(result.todo) : undefined
      };
    }
    
    return {
      success: result.success,
      message: result.message
    };
  }, [todoManager]);

  // 完成待办事项函数
  const completeTodoFunction = useCallback((taskIdentifier?: string | number): ExecutionResult => {
    console.log('🔧 [completeTodo] 开始完成任务:', taskIdentifier);
    
    if (!taskIdentifier) {
      return {
        success: false,
        message: '请指定要完成的任务'
      };
    }

    console.log('🔧 [completeTodo] 准备调用TodoManager');
    // 使用TodoManager完成任务
    const result = todoManager.completeTodo(String(taskIdentifier));
    console.log('🔧 [completeTodo] TodoManager结果:', result);
    
    // 同步状态
    if (result.success) {
      console.log('🔧 [completeTodo] 操作成功，准备更新状态');
      // 直接更新状态，避免调用syncFromBackend
      const listResult = todoManager.listTodos();
      console.log('🔧 [completeTodo] 获取最新列表:', listResult);
      
      if (listResult.success) {
        const newTodos = [...listResult.todos];
        console.log('🔧 [completeTodo] 准备设置新状态，todos:', newTodos.map(t => ({ id: t.id, task: t.task, completed: t.completed })));
        setTodos(newTodos);
        console.log('🔧 [completeTodo] setTodos完成');
      }
      
      return {
        success: result.success,
        message: result.message,
        data: result.todo ? convertBackendToFrontend(result.todo) : undefined
      };
    }
    
    return {
      success: result.success,
      message: result.message
    };
  }, [todoManager]);

  // 删除待办事项函数
  const deleteTodoFunction = useCallback((taskIdentifier?: string | number): ExecutionResult => {
    if (!taskIdentifier) {
      return {
        success: false,
        message: '请指定要删除的任务'
      };
    }

    // 使用TodoManager删除任务
    const result = todoManager.deleteTodo(String(taskIdentifier));
    
    // 同步状态
    if (result.success) {
      // 直接更新状态，避免调用syncFromBackend
      const listResult = todoManager.listTodos();
      if (listResult.success) {
        const newTodos = [...listResult.todos];
        setTodos(newTodos);
      }
      
      return {
        success: result.success,
        message: result.message,
        data: result.todo ? convertBackendToFrontend(result.todo) : undefined
      };
    }
    
    return {
      success: result.success,
      message: result.message
    };
  }, [todoManager]);

  // 列出所有待办事项函数
  const listTodosFunction = useCallback((): ExecutionResult => {
    const result = todoManager.listTodos();
    
    // 同步状态
    if (result.success) {
      // 强制创建新的数组对象以确保React重新渲染
      const newTodos = [...result.todos];
      setTodos(newTodos);
      return {
        success: result.success,
        message: result.message,
        data: result.todos.map(convertBackendToFrontend)
      };
    }
    
    return {
      success: result.success,
      message: result.message,
      data: []
    };
  }, [todoManager]);

  // 清除已完成任务函数
  const clearCompletedFunction = useCallback((): ExecutionResult => {
    const result = todoManager.clearCompleted();
    
    // 同步状态
    if (result.success) {
      // 直接更新状态，避免调用syncFromBackend
      const listResult = todoManager.listTodos();
      if (listResult.success) {
        const newTodos = [...listResult.todos];
        setTodos(newTodos);
      }
    }
    
    return {
      success: result.success,
      message: result.message,
      data: result.count > 0
    };
  }, [todoManager]);

  // 清除所有任务函数
  const clearAllFunction = useCallback((): ExecutionResult => {
    const result = todoManager.clearAll();
    
    // 同步状态
    if (result.success) {
      // 直接更新状态，避免调用syncFromBackend
      const listResult = todoManager.listTodos();
      if (listResult.success) {
        const newTodos = [...listResult.todos];
        setTodos(newTodos);
      }
    }
    
    return {
      success: result.success,
      message: result.message,
      data: result.count > 0
    };
  }, [todoManager]);

  // 执行指令的主函数
  const executeInstruction = useCallback((instruction: Instruction): ExecutionResult => {
    console.log('执行指令:', instruction);
    
    let result: ExecutionResult;
    
    switch (instruction.action) {
      case 'add':
        result = addTodo(instruction.task);
        break;
      case 'complete':
        result = completeTodoFunction(instruction.id || instruction.task);
        break;
      case 'delete':
        result = deleteTodoFunction(instruction.id || instruction.task);
        break;
      case 'list':
        result = listTodosFunction();
        break;
      case 'clear_completed':
        result = clearCompletedFunction();
        break;
      case 'clear_all':
        result = clearAllFunction();
        break;
      default:
        result = {
          success: false,
          message: `不支持的操作: ${instruction.action}`
        };
    }
    
    console.log('执行结果:', result);
    return result;
  }, [addTodo, completeTodoFunction, deleteTodoFunction, listTodosFunction, clearCompletedFunction, clearAllFunction]);

  // 获取支持的操作列表
  const getSupportedActions = useCallback((): string[] => {
    return ['add', 'complete', 'delete', 'list', 'clear_completed', 'clear_all'];
  }, []);

  // 初始化时同步状态 - 使用更安全的方式
  useEffect(() => {
    // 初始化时同步一次，但不依赖syncFromBackend避免循环
    const result = todoManager.listTodos();
    if (result.success && result.todos) {
      const newTodos = [...result.todos];
      setTodos(newTodos);
    }
  }, []); // 只在组件挂载时执行一次

  return {
    executeInstruction,
    getSupportedActions,
    // 直接导出各个函数，以便组件可以直接调用
    addTodo,
    completeTodo: completeTodoFunction,
    deleteTodo: deleteTodoFunction,
    listTodos: listTodosFunction,
    clearCompleted: clearCompletedFunction,
    clearAll: clearAllFunction
  };
} 