/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { parseInstruction, execute } from '../utils/instructionMapper';

interface ChatSidebarProps {
  onTasksUpdated?: () => void;
}

export default function ChatSidebar({ onTasksUpdated }: ChatSidebarProps) {
  const [executionResults, setExecutionResults] = useState<string[]>([]);
  const [showContext, setShowContext] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // 解析 AI 返回的指令
      const instruction = parseInstruction(message.content);
      if (instruction) {
        // 执行指令
        const result = execute(instruction);
        
        const resultText = result.success 
          ? `✅ ${result.message}` 
          : `❌ ${result.message}`;
          
        setExecutionResults(prev => [...prev, resultText]);
        
        // 通知父组件更新任务列表
        if (onTasksUpdated) {
          onTasksUpdated();
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

  // 从messages中提取最后添加的任务
  const getLastAddedTask = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.content.includes('"action": "add"')) {
        const match = msg.content.match(/"task":\s*"([^"]+)"/);
        if (match) {
          return match[1];
        }
      }
    }
    return null;
  };

  // 从messages中获取最近的操作
  const getRecentActions = () => {
    const actions = [];
    for (let i = messages.length - 1; i >= 0 && actions.length < 3; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        const actionMatch = msg.content.match(/"action":\s*"([^"]+)"/);
        const taskMatch = msg.content.match(/"task":\s*"([^"]+)"/);
        if (actionMatch) {
          actions.unshift({
            action: actionMatch[1],
            task: taskMatch ? taskMatch[1] : '',
          });
        }
      }
    }
    return actions;
  };

  const lastTask = getLastAddedTask();
  const recentActions = getRecentActions();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            🤖 AI 指令助手 (记忆版)
          </h2>
          <button
            onClick={() => setShowContext(!showContext)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              showContext 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            title="切换上下文视图"
          >
            {showContext ? '💬 对话' : '📋 上下文'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          支持上下文引用：再加一个、刚才那个...
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          消息: {messages.length} | 支持：添加、列表、清空
        </p>
        
        {lastTask && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <span className="text-blue-600 dark:text-blue-400">
              💡 最后添加: &ldquo;{lastTask}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showContext ? (
          // 上下文视图
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📋 对话上下文
            </h3>
            
            {lastTask && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">最后添加的任务:</div>
                <div className="text-blue-600 dark:text-blue-400">{lastTask}</div>
              </div>
            )}
            
            {recentActions.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <div className="font-medium text-green-700 dark:text-green-300 mb-2">最近操作:</div>
                <ul className="space-y-1">
                  {recentActions.map((action, index) => (
                    <li key={index} className="text-xs text-green-600 dark:text-green-400">
                      • {action.action}: {action.task || '执行成功'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-sm">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">对话历史:</div>
              <div className="text-gray-600 dark:text-gray-400">{messages.length} 条消息</div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
              <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">💡 试试这些命令:</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                <div>• "再加一个任务"</div>
                <div>• "列出刚才的任务"</div>
                <div>• "清空所有任务"</div>
              </div>
            </div>
          </div>
        ) : (
          // 对话视图
          <>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p className="text-2xl mb-2">🎯</p>
                <p>你好！我是你的 AI 指令助手</p>
                <p className="text-sm mt-1">🧠 记忆版：我能记住我们的对话</p>
                <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                  <p>📝 &ldquo;添加学习 JavaScript 任务&rdquo;</p>
                  <p>🔄 &ldquo;再加一个类似的任务&rdquo;</p>
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
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="支持上下文：再加一个、刚才那个..."
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
        
        {/* 快捷操作按钮 */}
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            '添加学习任务',
            '再加一个任务',
            '列出所有任务',
            '清空任务'
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleInputChange({ target: { value: example } } as any)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 