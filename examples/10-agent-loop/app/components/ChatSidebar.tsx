'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from 'ai/react';
import { Instruction, ExecutionResult } from '../utils/instructionMapper';

interface ChatSidebarProps {
  executeInstruction: (instruction: Instruction) => ExecutionResult;
}

interface ExtendedExecutionResult extends ExecutionResult {
  id?: string;
  timestamp?: number;
}

export default function ChatSidebar({ executeInstruction }: ChatSidebarProps) {
  const [executionResults, setExecutionResults] = useState<ExtendedExecutionResult[]>([]);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用useChat hook处理流式响应
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      console.log('🔧 前端工具调用:', toolCall);
      
      // 解析工具调用并触发前端状态同步
      try {
        let instruction: Instruction;
        
        switch (toolCall.toolName) {
          case 'addTodo':
            instruction = {
              action: 'add',
              task: (toolCall.args as { task: string }).task
            };
            break;
          case 'completeTodo':
            instruction = {
              action: 'complete',
              task: (toolCall.args as { taskIdentifier: string }).taskIdentifier
            };
            break;
          case 'deleteTodo':
            instruction = {
              action: 'delete',
              task: (toolCall.args as { taskIdentifier: string }).taskIdentifier
            };
            break;
          case 'listTodos':
            instruction = {
              action: 'list'
            };
            break;
          case 'clearCompleted':
            instruction = {
              action: 'clear_completed'
            };
            break;
          case 'clearAll':
            instruction = {
              action: 'clear_all'
            };
            break;
          default:
            console.warn('未知工具调用:', toolCall.toolName);
            return `工具 ${toolCall.toolName} 执行完成`;
        }
        
        console.log('🎯 即将执行前端指令:', instruction);
        
        // 调用前端的executeInstruction来同步状态
        const result = executeInstruction(instruction);
        console.log('🔄 前端状态同步结果:', result);
        
        // 添加执行结果到UI
        const uiResult: ExtendedExecutionResult = {
          id: `tool_${Date.now()}`,
          message: result.message || `执行 ${toolCall.toolName} 完成`,
          success: result.success,
          timestamp: Date.now(),
          data: result.data
        };
        
        setExecutionResults(prev => [...prev.slice(-9), uiResult]);
        
        return result.message || `工具 ${toolCall.toolName} 执行完成`;
        
      } catch (error) {
        console.error('前端状态同步失败:', error);
        return `工具 ${toolCall.toolName} 执行出错`;
      }
    },
    onFinish: (message) => {
      console.log('🎉 对话完成:', message);
    },
    onError: (error) => {
      console.error('💥 对话错误:', error);
    }
  });

  // 使用Token统计hook - 暂时禁用复杂统计，使用简单计算
  const tokenStats = useMemo(() => ({
    totalTokens: messages.reduce((sum, m) => sum + Math.ceil(m.content.length * 0.3), 0),
    userTokens: messages.filter(m => m.role === 'user').reduce((sum, m) => sum + Math.ceil(m.content.length * 0.3), 0),
    assistantTokens: messages.filter(m => m.role === 'assistant').reduce((sum, m) => sum + Math.ceil(m.content.length * 0.3), 0),
    isNearLimit: false,
    warningLevel: 'safe' as 'safe' | 'warning' | 'danger',
    isEstimated: true
  }), [messages]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // 只依赖消息数量，而不是整个messages数组

  // 使用useMemo缓存计算结果，避免每次渲染都重新计算
  const lastTask = useMemo(() => {
    // 从执行结果中找到最后添加的任务
    for (let i = executionResults.length - 1; i >= 0; i--) {
      const result = executionResults[i];
      if (result.success && result.message && result.message.includes('已添加任务')) {
        const match = result.message.match(/已添加任务[：:]\s*"?([^"]+)"?/);
        if (match) {
          return match[1].replace(/"/g, '');
        }
      }
    }
    
    // 备用方案：从消息中查找
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.content.includes('已添加')) {
        const match = msg.content.match(/任务\s*["""]([^"""]+)["""]/);
        if (match) {
          return match[1];
        }
      }
    }
    return null;
  }, [executionResults, messages]);

  const recentActions = useMemo(() => {
    const actions = [];
    
    // 从执行结果中获取最近的操作
    for (let i = executionResults.length - 1; i >= 0 && actions.length < 5; i--) {
      const result = executionResults[i];
      if (result.message) {
        actions.unshift({
          action: result.message.includes('添加') ? 'add' : 
                  result.message.includes('完成') ? 'complete' :
                  result.message.includes('删除') ? 'delete' : 'other',
          task: result.message,
          timestamp: result.timestamp || Date.now()
        });
      }
    }
    
    return actions;
  }, [executionResults]);

  // 获取Token警告颜色
  const getTokenWarningColor = () => {
    switch (tokenStats.warningLevel) {
      case 'danger': return 'text-red-600 dark:text-red-400 font-medium';
      case 'warning': return 'text-orange-600 dark:text-orange-400 font-medium';
      case 'safe':
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            🔄 Agent Loop 助手
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
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Agent Loop: 多轮执行闭环 | 消息: {messages.length}</span>
          <div className="flex items-center gap-1">
            <span className={getTokenWarningColor()}>
              Token: {tokenStats.totalTokens}/3000
            </span>
            {tokenStats.isEstimated && (
              <span className="text-yellow-600 dark:text-yellow-400" title="使用估算方法">
                ~
              </span>
            )}
          </div>
        </div>
        
        {tokenStats.isNearLimit && (
          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-400">
            ⚠️ Token使用量较高，较早的对话可能会被自动裁剪
          </div>
        )}
        
        {lastTask && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <span className="text-blue-600 dark:text-blue-400">
              💡 最后添加: &ldquo;{lastTask}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {showContext ? (
          // 上下文视图
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📋 对话上下文
            </h3>
            
            {/* Token使用统计 */}
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
              <strong>Token使用情况:</strong>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>当前使用:</span>
                  <span className={getTokenWarningColor()}>
                    {tokenStats.totalTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>用户消息:</span>
                  <span>{tokenStats.userTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI消息:</span>
                  <span>{tokenStats.assistantTokens}</span>
                </div>
              </div>
            </div>

            {/* 最近操作 */}
            {recentActions.length > 0 && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <strong>最近操作:</strong>
                <div className="mt-1 space-y-1 text-xs">
                  {recentActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="truncate flex-1">{action.task}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // 对话视图
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-lg font-medium mb-2">Agent Loop 助手</h3>
                <p className="text-sm">
                  我可以执行复合任务，自动规划多个步骤完成目标
                </p>
                <div className="mt-4 text-xs space-y-1">
                  <p>💡 试试说：&ldquo;添加三个任务然后完成第一个&rdquo;</p>
                  <p>💡 或者：&ldquo;把所有任务都完成后清理&rdquo;</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    🔄 Agent Loop 执行中...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="请输入复合任务指令..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '⏳' : '发送'}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Agent Loop 会自动拆解复合任务并逐步执行
        </div>
      </div>
    </div>
  );
} 