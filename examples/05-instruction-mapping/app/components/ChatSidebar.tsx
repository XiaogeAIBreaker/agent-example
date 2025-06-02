'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Instruction, ExecutionResult } from '../utils/instructionMapper';
import { useInstructionExecutor } from '../hooks/useInstructionExecutor';

// 定义组件props
interface ChatSidebarProps {
  executeInstruction?: (instruction: Instruction) => ExecutionResult;
  onInstructionExecuted?: (result: { success: boolean; message?: string }) => void;
}

export default function ChatSidebar({ executeInstruction, onInstructionExecuted }: ChatSidebarProps) {
  const [executionResults, setExecutionResults] = useState<string[]>([]);
  
  // 指令执行器
  const { parseAndExecuteMessage } = useInstructionExecutor({
    executeInstruction: executeInstruction || (() => ({ success: false, message: '指令执行器未配置' }))
  });
  
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // 当AI响应完成时，尝试执行指令
      if (executeInstruction) {
        const result = parseAndExecuteMessage(message.content);
        
        if (result) {
          const resultText = result.success 
            ? `✅ ${result.message}` 
            : `❌ ${result.message}`;
            
          setExecutionResults(prev => [...prev, resultText]);
          
          // 通知父组件
          if (onInstructionExecuted) {
            onInstructionExecuted({ 
              success: result.success, 
              message: result.message 
            });
          }
        }
      }
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, executionResults]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            🤖 AI 指令助手
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            我可以通过指令映射直接操作你的待办事项
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            支持：添加、完成、删除、列表、清除等操作
          </p>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-2xl mb-2">🎯</p>
            <p>你好！我是你的 AI 指令助手</p>
            <p className="text-sm mt-1">我可以直接执行待办事项操作</p>
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>📝 &ldquo;添加学习 Python 任务&rdquo;</p>
              <p>✅ &ldquo;完成学习任务&rdquo;</p>
              <p>🗑️ &ldquo;删除买菜任务&rdquo;</p>
              <p>📋 &ldquo;显示所有任务&rdquo;</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {/* 显示执行结果 */}
        {executionResults.map((result, index) => (
          <div key={`result-${index}`} className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm max-w-[90%]">
              <div className="flex items-center gap-2">
                <span className="text-green-600">⚡</span>
                <span>指令执行结果：{result}</span>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span>正在分析指令并执行中...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="输入指令，如：添加学习任务..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            执行
          </button>
        </form>
      </div>
    </div>
  );
} 