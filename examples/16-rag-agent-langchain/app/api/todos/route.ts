import { getTodoManager } from '../chat/todoManager';

export async function GET() {
  try {
    const todoManager = getTodoManager();
    const result = todoManager.listTodos();
    
    return Response.json({
      success: result.success,
      message: result.message,
      todos: result.todos,
      stats: todoManager.getStats()
    });
  } catch (error) {
    console.error('获取Todo列表失败:', error);
    return Response.json(
      { error: 'Failed to get todos' }, 
      { status: 500 }
    );
  }
} 