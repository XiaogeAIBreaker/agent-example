'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import { getTodos, addTodo, clearTodos } from '../utils/instructionMapper';

export default function Page() {
  const [todos, setTodos] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // 添加新任务
  const handleAddTodo = () => {
    if (inputValue.trim() !== '') {
      const result = addTodo(inputValue.trim());
      if (result.success) {
        setInputValue('');
        syncTodos();
      } else {
        console.error('添加任务失败:', result.message);
      }
    }
  };

  // 清空所有任务
  const handleClearAll = () => {
    const result = clearTodos();
    if (result.success) {
      syncTodos();
    } else {
      console.error('清空任务失败:', result.message);
    }
  };

  // 同步获取任务列表
  const syncTodos = () => {
    setTodos(getTodos());
  };

  // 初始化获取任务
  useEffect(() => {
    syncTodos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6">
        {/* 左侧：待办事项 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
              📝 简单指令执行待办事项
            </h1>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              演示 AI 指令到本地函数的基础执行流程 | 支持操作: 添加, 列表, 清空
            </p>
          </div>
          
          {/* 添加新任务 */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddTodo}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              添加
            </button>
          </div>

          {/* 统计信息 */}
          {todos.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                总计: {todos.length} 个任务
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
                  💡 你可以直接在此添加，或向<span className="lg:inline hidden">右侧</span><span className="lg:hidden inline">下方</span>的 AI 助手发送指令
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  例如：&ldquo;帮我添加一个学习任务&rdquo; 或 &ldquo;列出所有任务&rdquo;
                </p>
              </div>
            ) : (
              todos.map((todo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                >
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-gray-800 dark:text-white">
                    {todo}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 快捷操作 */}
          {todos.length > 0 && (
            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
              >
                清空全部 ({todos.length})
              </button>
              <button
                onClick={syncTodos}
                className="px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
              >
                刷新列表
              </button>
            </div>
          )}
        </div>

        {/* 右侧：AI助手侧边栏 */}
        <div className="w-full lg:w-80 h-96 lg:h-full">
          <ChatSidebar onTasksUpdated={syncTodos} />
        </div>
      </div>
    </div>
  );
} 