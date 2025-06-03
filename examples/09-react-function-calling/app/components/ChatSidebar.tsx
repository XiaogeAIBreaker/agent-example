'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useTokenStats } from '../hooks/useTokenStats';
import { Instruction, ExecutionResult } from '../utils/instructionMapper';

interface ChatSidebarProps {
  executeInstruction: (instruction: Instruction) => ExecutionResult;
}

export default function ChatSidebar({ executeInstruction }: ChatSidebarProps) {
  const [showContext, setShowContext] = useState(false);
  const [executionResults, setExecutionResults] = useState<Array<{id: string, message: string, success: boolean, timestamp: number}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      console.log('Tool call received:', toolCall);
      
      // 将tool call映射到instruction
      let instruction: Instruction;
      
      switch (toolCall.toolName) {
        case 'addTodo':
          instruction = {
            action: 'add',
            task: (toolCall.args as { task: string }).task
          };
          break;
        case 'completeTodo':
          // 尝试解析为数字ID，否则作为文本
          const completeId = parseInt((toolCall.args as { taskIdentifier: string }).taskIdentifier);
          instruction = {
            action: 'complete',
            ...(isNaN(completeId) ? { task: (toolCall.args as { taskIdentifier: string }).taskIdentifier } : { id: completeId })
          };
          break;
        case 'deleteTodo':
          // 尝试解析为数字ID，否则作为文本
          const deleteId = parseInt((toolCall.args as { taskIdentifier: string }).taskIdentifier);
          instruction = {
            action: 'delete',
            ...(isNaN(deleteId) ? { task: (toolCall.args as { taskIdentifier: string }).taskIdentifier } : { id: deleteId })
          };
          break;
        case 'listTodos':
          instruction = { action: 'list' };
          break;
        case 'clearCompleted':
          instruction = { action: 'clear_completed' };
          break;
        case 'clearAll':
          instruction = { action: 'clear_all' };
          break;
        case 'queryCurrentTasks':
          instruction = { 
            action: 'query_current',
            includeCompleted: (toolCall.args as { includeCompleted?: boolean }).includeCompleted
          };
          break;
        case 'completeAllTasks':
          instruction = { 
            action: 'complete_all',
            confirmMessage: (toolCall.args as { confirmMessage?: string }).confirmMessage
          };
          break;
        case 'generateDailyReport':
          instruction = { 
            action: 'generate_report',
            reportType: (toolCall.args as { reportType?: string }).reportType
          };
          break;
        case 'taskSummary':
          instruction = { 
            action: 'task_summary',
            detailed: (toolCall.args as { detailed?: boolean }).detailed
          };
          break;
        default:
          console.warn('Unknown tool call:', toolCall.toolName);
          return `未知的工具调用: ${toolCall.toolName}`;
      }
      
      // 执行指令
      const result = executeInstruction(instruction);
      
      // 记录执行结果
      setExecutionResults(prev => [...prev.slice(-9), {
        id: `result_${Date.now()}`,
        message: result.message || (result.success ? '执行成功' : '执行失败'),
        success: result.success,
        timestamp: Date.now()
      }]);
      
      // 返回执行结果给AI
      return result.message || (result.success ? '操作已完成' : '操作失败');
    }
  });

  // 使用Token统计hook
  const tokenStats = useTokenStats(messages, 3000);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, executionResults]);

  // 从messages中提取上下文信息
  const getLastAddedTask = () => {
    // 从执行结果中找到最后添加的任务
    for (let i = executionResults.length - 1; i >= 0; i--) {
      const result = executionResults[i];
      if (result.success && result.message.includes('已添加任务')) {
        const match = result.message.match(/已添加任务[：:]\s*"?([^"]+)"?/);
        if (match) {
          return match[1].replace(/"/g, '');
        }
      }
    }
    
    // 备用方案：从tool calls中查找
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.toolInvocations) {
        for (const toolInvocation of msg.toolInvocations) {
          if (toolInvocation.toolName === 'addTodo' && toolInvocation.args) {
            return toolInvocation.args.task;
          }
        }
      }
    }
    return null;
  };

  // 从messages中获取最近的操作
  const getRecentActions = () => {
    const actions = [];
    
    // 从执行结果中获取最近的操作
    for (let i = executionResults.length - 1; i >= 0 && actions.length < 5; i--) {
      const result = executionResults[i];
      actions.unshift({
        action: result.message.includes('添加') ? 'add' : 
                result.message.includes('完成') ? 'complete' :
                result.message.includes('删除') ? 'delete' : 'other',
        task: result.message,
        timestamp: result.timestamp
      });
    }
    
    return actions;
  };

  // 简单的上下文引用处理
  const enhanceUserInput = (userInput: string) => {
    const lastTask = getLastAddedTask();
    
    let enhancedInput = userInput;
    
    // 处理"刚才"、"最后"等引用
    if (userInput.includes('刚才') || userInput.includes('最后') || userInput.includes('上个')) {
      if (lastTask) {
        enhancedInput += `\n(注：最近添加的任务是"${lastTask}")`;
      }
    }
    
    // 处理"再加"等重复操作
    if (userInput.includes('再加') || userInput.includes('再添加')) {
      if (lastTask) {
        enhancedInput += `\n(注：上次添加的是"${lastTask}"，请添加类似的任务)`;
      }
    }
    
    return enhancedInput;
  };

  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // 增强用户输入
    const enhancedInput = enhanceUserInput(input.trim());
    
    // 如果输入被增强了，先更新input然后提交
    if (enhancedInput !== input.trim()) {
      handleInputChange({ target: { value: enhancedInput } } as React.ChangeEvent<HTMLInputElement>);
      setTimeout(() => {
        handleSubmit(e);
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }, 0);
    } else {
      handleSubmit(e);
    }
  };

  const lastTask = getLastAddedTask();
  const recentActions = getRecentActions();

  // 获取Token警告颜色
  const getTokenWarningColor = () => {
    switch (tokenStats.warningLevel) {
      case 'danger': return 'text-red-600 dark:text-red-400 font-medium';
      case 'warning': return 'text-orange-600 dark:text-orange-400 font-medium';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            🤖 AI 助手
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
          <span>Function Calling 机制 | 消息: {messages.length}</span>
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
                  <span>AI回复:</span>
                  <span>{tokenStats.assistantTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>平均/消息:</span>
                  <span>{tokenStats.averageTokensPerMessage}</span>
                </div>
                <div className="flex justify-between">
                  <span>限制:</span>
                  <span>3000</span>
                </div>
                <div className="flex justify-between">
                  <span>剩余:</span>
                  <span className={tokenStats.isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                    {3000 - tokenStats.totalTokens}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      tokenStats.warningLevel === 'danger' ? 'bg-red-500' :
                      tokenStats.warningLevel === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((tokenStats.totalTokens / 3000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {lastTask && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <strong>最后添加的任务:</strong> {lastTask}
              </div>
            )}
            
            {recentActions.length > 0 && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <strong>最近操作:</strong>
                <ul className="mt-1 space-y-1">
                  {recentActions.map((action, index) => (
                    <li key={index} className="text-xs">
                      • {action.action}: {action.task}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-sm">
              <strong>对话历史:</strong> {messages.length} 条消息
            </div>
          </div>
        ) : (
          // 对话视图
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p className="text-2xl mb-2">👋</p>
                <p>你好！我是你的 AI 助手</p>
                <p className="text-sm mt-1">支持上下文对话，试试说&ldquo;再加一个任务&rdquo;</p>
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
            {executionResults.map((result) => (
              <div key={result.id} className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm max-w-[90%]">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">⚡</span>
                    <span>指令执行结果：{result.success ? '✅' : '❌'} {result.message}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    <span>正在思考中...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="输入消息，支持'再加一个'、'完成刚才的'等上下文指令..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
} 