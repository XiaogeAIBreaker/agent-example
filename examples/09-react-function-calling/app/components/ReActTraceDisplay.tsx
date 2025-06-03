'use client';

import { useState } from 'react';

interface ReActStep {
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  timestamp: number;
  toolCall?: {
    name: string;
    args: object;
  };
  result?: {
    success: boolean;
    message: string;
  };
}

interface ReActTraceDisplayProps {
  steps: ReActStep[];
  isProcessing?: boolean;
}

export default function ReActTraceDisplay({ steps, isProcessing }: ReActTraceDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  if (steps.length === 0 && !isProcessing) return null;

  const getStepIcon = (type: ReActStep['type']) => {
    switch (type) {
      case 'thought': return '🤔';
      case 'action': return '⚡';
      case 'observation': return '👀';
      case 'final': return '✅';
      default: return '📝';
    }
  };

  const getStepColor = (type: ReActStep['type']) => {
    switch (type) {
      case 'thought': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'action': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      case 'observation': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'final': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getStepTitle = (type: ReActStep['type']) => {
    switch (type) {
      case 'thought': return '思考 (Thought)';
      case 'action': return '行动 (Action)';
      case 'observation': return '观察 (Observation)';
      case 'final': return '总结 (Final)';
      default: return '步骤';
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          🔄 ReAct 推理链
          {isProcessing && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
              执行中...
            </span>
          )}
        </h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {expanded ? '收起' : '展开'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${getStepColor(step.type)} transition-all duration-200`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{getStepIcon(step.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {getStepTitle(step.type)}
                    </h5>
                    <span className="text-xs text-gray-400">
                      步骤 {index + 1}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {step.content}
                  </div>

                  {step.toolCall && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-xs">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">函数调用:</div>
                      <div className="font-mono text-blue-600 dark:text-blue-400">
                        {step.toolCall.name}({JSON.stringify(step.toolCall.args, null, 2)})
                      </div>
                    </div>
                  )}

                  {step.result && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      step.result.success 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      <div className="font-medium mb-1">
                        {step.result.success ? '✅ 执行成功' : '❌ 执行失败'}
                      </div>
                      <div>{step.result.message}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && steps.length > 0 && (
            <div className="p-3 rounded border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full delay-150"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full delay-300"></div>
                <span>AI正在思考下一步...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!expanded && steps.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          共 {steps.length} 个步骤 • 最后: {getStepTitle(steps[steps.length - 1]?.type)}
        </div>
      )}
    </div>
  );
} 