import { useState, useCallback } from 'react';

// 记忆条目接口
export interface MemoryEntry {
  id: string;
  timestamp: number;
  type: 'user_message' | 'ai_response' | 'action_executed' | 'context_reference';
  content: string;
  metadata?: {
    action?: string;
    taskId?: number;
    taskText?: string;
    reference?: string;
  };
}

// 上下文类型
export interface Context {
  recentActions: Array<{
    action: string;
    taskId?: number;
    taskText?: string;
    timestamp: number;
  }>;
  lastAddedTask?: {
    id: number;
    text: string;
    timestamp: number;
  };
  recentMessages: Array<{
    content: string;
    timestamp: number;
    type: 'user' | 'ai';
  }>;
}

export function useMemory() {
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [context, setContext] = useState<Context>({
    recentActions: [],
    recentMessages: []
  });

  // 添加记忆条目
  const addMemoryEntry = useCallback((entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: MemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setMemory(prev => [...prev.slice(-49), newEntry]); // 保持最近50条记录
    return newEntry;
  }, []);

  // 记录用户消息
  const recordUserMessage = useCallback((message: string) => {
    addMemoryEntry({
      type: 'user_message',
      content: message
    });

    // 更新上下文中的最近消息
    setContext(prev => ({
      ...prev,
      recentMessages: [
        ...prev.recentMessages.slice(-9), // 保持最近10条消息
        {
          content: message,
          timestamp: Date.now(),
          type: 'user'
        }
      ]
    }));
  }, [addMemoryEntry]);

  // 记录AI回复
  const recordAIResponse = useCallback((response: string) => {
    addMemoryEntry({
      type: 'ai_response',
      content: response
    });

    // 更新上下文中的最近消息
    setContext(prev => ({
      ...prev,
      recentMessages: [
        ...prev.recentMessages.slice(-9),
        {
          content: response,
          timestamp: Date.now(),
          type: 'ai'
        }
      ]
    }));
  }, [addMemoryEntry]);

  // 记录执行的动作
  const recordAction = useCallback((action: string, taskId?: number, taskText?: string) => {
    addMemoryEntry({
      type: 'action_executed',
      content: `执行动作: ${action}${taskText ? ` - ${taskText}` : ''}`,
      metadata: {
        action,
        taskId,
        taskText
      }
    });

    // 更新上下文中的最近动作
    setContext(prev => ({
      ...prev,
      recentActions: [
        ...prev.recentActions.slice(-9), // 保持最近10个动作
        {
          action,
          taskId,
          taskText,
          timestamp: Date.now()
        }
      ],
      // 如果是添加任务，更新最后添加的任务
      ...(action === 'add' && taskId && taskText ? {
        lastAddedTask: {
          id: taskId,
          text: taskText,
          timestamp: Date.now()
        }
      } : {})
    }));
  }, [addMemoryEntry]);

  // 记录上下文引用
  const recordContextReference = useCallback((reference: string, content: string) => {
    addMemoryEntry({
      type: 'context_reference',
      content,
      metadata: {
        reference
      }
    });
  }, [addMemoryEntry]);

  // 解析上下文引用（如"刚才那个"、"最后一个"等）
  const resolveContextReference = useCallback((userInput: string) => {
    const input = userInput.toLowerCase();
    let resolvedContext = '';
    
    // 检查是否引用了"刚才"、"最后"、"上一个"等
    if (input.includes('刚才') || input.includes('最后') || input.includes('上一个') || input.includes('上个')) {
      if (input.includes('添加') || input.includes('任务')) {
        // 引用最后添加的任务
        if (context.lastAddedTask) {
          resolvedContext = `引用最后添加的任务: "${context.lastAddedTask.text}" (ID: ${context.lastAddedTask.id})`;
          recordContextReference('last_added_task', resolvedContext);
          return {
            type: 'task_reference',
            taskId: context.lastAddedTask.id,
            taskText: context.lastAddedTask.text,
            resolvedText: resolvedContext
          };
        }
      } else {
        // 引用最后的动作
        const lastAction = context.recentActions[context.recentActions.length - 1];
        if (lastAction) {
          resolvedContext = `引用最后的动作: ${lastAction.action}${lastAction.taskText ? ` - ${lastAction.taskText}` : ''}`;
          recordContextReference('last_action', resolvedContext);
          return {
            type: 'action_reference',
            action: lastAction.action,
            taskId: lastAction.taskId,
            taskText: lastAction.taskText,
            resolvedText: resolvedContext
          };
        }
      }
    }

    // 检查是否引用了"再"、"再加"等
    if (input.includes('再加') || input.includes('再添加')) {
      const lastAddAction = context.recentActions
        .slice()
        .reverse()
        .find(action => action.action === 'add');
      
      if (lastAddAction) {
        resolvedContext = `基于上次添加的任务模式: "${lastAddAction.taskText}"`;
        recordContextReference('repeat_add_pattern', resolvedContext);
        return {
          type: 'repeat_pattern',
          action: 'add',
          referenceTask: lastAddAction.taskText,
          resolvedText: resolvedContext
        };
      }
    }

    return null;
  }, [context, recordContextReference]);

  // 获取上下文摘要（用于发送给AI）
  const getContextSummary = useCallback(() => {
    const recentMessages = context.recentMessages.slice(-6); // 最近3轮对话
    const recentActions = context.recentActions.slice(-5); // 最近5个动作
    
    let summary = '';
    
    if (recentMessages.length > 0) {
      summary += '最近的对话:\n';
      recentMessages.forEach(msg => {
        summary += `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
      });
      summary += '\n';
    }
    
    if (recentActions.length > 0) {
      summary += '最近的操作:\n';
      recentActions.forEach(action => {
        summary += `${action.action}: ${action.taskText || '无具体任务'}\n`;
      });
      summary += '\n';
    }
    
    if (context.lastAddedTask) {
      summary += `最后添加的任务: "${context.lastAddedTask.text}" (ID: ${context.lastAddedTask.id})\n`;
    }
    
    return summary;
  }, [context]);

  // 清除记忆（可选功能）
  const clearMemory = useCallback(() => {
    setMemory([]);
    setContext({
      recentActions: [],
      recentMessages: []
    });
  }, []);

  return {
    memory,
    context,
    addMemoryEntry,
    recordUserMessage,
    recordAIResponse,
    recordAction,
    recordContextReference,
    resolveContextReference,
    getContextSummary,
    clearMemory
  };
} 