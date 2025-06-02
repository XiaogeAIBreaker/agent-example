'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useInstructionExecutor } from '../hooks/useInstructionExecutor';
import { useMemory } from '../hooks/useMemory';
import { Instruction, ExecutionResult } from '../utils/instructionMapper';

interface ChatSidebarProps {
  executeInstruction: (instruction: Instruction) => ExecutionResult;
}

export default function ChatSidebar({ executeInstruction }: ChatSidebarProps) {
  const [showMemory, setShowMemory] = useState(false);
  const [executionResults, setExecutionResults] = useState<Array<{id: string, message: string, success: boolean, timestamp: number}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 使用记忆hook
  const {
    memory,
    context,
    recordUserMessage,
    recordAIResponse,
    resolveContextReference,
    getContextSummary,
    clearMemory
  } = useMemory();
  
  // 使用指令执行器
  const { parseAndExecuteMessage } = useInstructionExecutor({ executeInstruction });

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [memory, executionResults]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      console.log('AI 回复完成:', message.content);
      console.log('开始解析和执行指令...');
      
      // 记录AI回复
      recordAIResponse(message.content);
      
      // 尝试执行AI回复中的指令
      const result = parseAndExecuteMessage(message.content);
      if (result) {
        console.log('指令执行结果:', result);
        
        // 添加执行结果到状态
        setExecutionResults(prev => [...prev.slice(-9), {
          id: `result_${Date.now()}`,
          message: result.message || '执行完成',
          success: result.success,
          timestamp: Date.now()
        }]);
      } else {
        console.log('没有找到可执行的指令');
      }
    }
  });

  // 处理表单提交，添加上下文信息
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    
    // 记录用户消息
    recordUserMessage(userInput);
    
    // 解析上下文引用
    const contextRef = resolveContextReference(userInput);
    
    // 获取上下文摘要
    const contextSummary = getContextSummary();
    
    // 构建增强的提示词
    let enhancedPrompt = userInput;
    
    if (contextRef) {
      enhancedPrompt = `用户消息: ${userInput}\n\n上下文解析: ${contextRef.resolvedText}\n`;
      
      // 如果是任务引用，添加具体信息
      if (contextRef.type === 'task_reference' && contextRef.taskId) {
        enhancedPrompt += `引用的任务ID: ${contextRef.taskId}\n`;
      }
    }
    
    if (contextSummary) {
      enhancedPrompt += `\n历史上下文:\n${contextSummary}`;
    }
    
    enhancedPrompt += `\n请基于以上上下文理解用户的真实意图，并生成相应的操作指令。`;
    
    // 调用原始的handleSubmit，但先修改input值
    handleInputChange({ target: { value: enhancedPrompt } } as React.ChangeEvent<HTMLInputElement>);
    
    // 立即提交表单
    setTimeout(() => {
      handleSubmit(e);
      // 恢复显示原始输入
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }, 0);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMemoryTypeLabel = (type: string) => {
    switch (type) {
      case 'user_message': return '💬 用户';
      case 'ai_response': return '🤖 AI';
      case 'action_executed': return '⚡ 执行';
      case 'context_reference': return '🔗 引用';
      default: return '📝';
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowMemory(!showMemory)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                showMemory 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
              title="切换记忆视图"
            >
              {showMemory ? '💬 对话' : '🧠 记忆'}
            </button>
            {memory.length > 0 && (
              <button
                onClick={clearMemory}
                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                title="清除记忆"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          支持上下文对话 | 记忆条目: {memory.length}
        </p>
        
        {context.lastAddedTask && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <span className="text-blue-600 dark:text-blue-400">
              💡 最后添加: &ldquo;{context.lastAddedTask.text}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {showMemory ? (
          // 记忆视图
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📝 对话记忆
            </h3>
            {memory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                暂无记忆记录
              </p>
            ) : (
              memory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-2 rounded-lg text-xs ${
                    entry.type === 'user_message'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-300'
                      : entry.type === 'ai_response'
                      ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-300'
                      : entry.type === 'action_executed'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-300'
                      : 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {getMemoryTypeLabel(entry.type)}
                    </span>
                    <span className="text-gray-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {entry.content}
                  </p>
                  {entry.metadata && (
                    <div className="mt-1 text-gray-500">
                      {entry.metadata.action && (
                        <span>动作: {entry.metadata.action}</span>
                      )}
                      {entry.metadata.taskId && (
                        <span> | ID: {entry.metadata.taskId}</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // 对话视图
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  👋 你好！我是你的AI助手
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  我可以帮你管理待办事项，支持以下功能：
                </p>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <p>✅ &ldquo;帮我添加一个学习任务&rdquo;</p>
                  <p>🔄 &ldquo;再加一个类似的任务&rdquo;</p>
                  <p>✅ &ldquo;完成刚才那个任务&rdquo;</p>
                  <p>🗑️ &ldquo;把最后添加的删了&rdquo;</p>
                  <p>📋 &ldquo;显示所有任务&rdquo;</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    {/* 只显示用户原始输入，不显示增强后的提示词 */}
                    {message.role === 'user' ? (
                      message.content.split('\n')[0].replace('用户消息: ', '')
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* 显示执行结果 */}
            {executionResults.map((result) => (
              <div key={result.id} className="flex justify-center">
                <div className={`max-w-[90%] px-3 py-2 rounded-lg text-sm border ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{result.success ? '✅' : '❌'}</span>
                    <span className="font-medium">指令执行:</span>
                    <span>{result.message}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        <form onSubmit={handleFormSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="输入消息，支持上下文引用..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isLoading ? '⏳' : '发送'}
            </button>
          </div>
          
          {/* 快捷输入建议 */}
          <div className="flex flex-wrap gap-1">
            {[
              '再加一个任务',
              '完成刚才那个',
              '删除最后一个',
              '显示所有任务'
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
} 