'use client';

import { useState } from 'react';
import ChatSidebar from './components/ChatSidebar';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6">
        {/* 左侧：待办事项 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
            📝 待办事项
          </h1>
          
          {/* 添加新任务 */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addTodo}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              添加
            </button>
          </div>

          {/* 统计信息 */}
          {totalCount > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                总计: {totalCount} 任务 | 已完成: {completedCount} 任务 | 
                剩余: {totalCount - completedCount} 任务
              </p>
            </div>
          )}

          {/* 任务列表 */}
          <div className="space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  暂无任务，添加一个新任务开始吧！
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  💡 你也可以向<span className="lg:inline hidden">右侧</span><span className="lg:hidden inline">下方</span>的 AI 助手寻求帮助和建议
                </p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    todo.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-800 dark:text-white'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
                    title="删除任务"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 快捷操作 */}
          {todos.length > 0 && (
            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={() => setTodos(todos.filter(todo => !todo.completed))}
                className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                disabled={completedCount === 0}
              >
                清除已完成 ({completedCount})
              </button>
              <button
                onClick={() => setTodos([])}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                清除全部
              </button>
            </div>
          )}
        </div>

        {/* 右侧：AI助手侧边栏 */}
        <div className="w-full lg:w-80 h-96 lg:h-full">
          <ChatSidebar />
        </div>
      </div>
    </div>
  );
}
