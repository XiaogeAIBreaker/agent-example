// 定义操作类型
export interface TodoAction {
  action: 'add' | 'complete' | 'delete' | 'list';
  task?: string;
}

// 安全解析JSON的函数
export function safeParseJSON(text: string): TodoAction | null {
  try {
    // 使用正则表达式提取JSON部分
    const jsonMatch = text.match(/\{[^}]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString);
    
    // 验证解析结果的结构
    if (typeof parsed === 'object' && 
        parsed !== null && 
        'action' in parsed &&
        ['add', 'complete', 'delete', 'list'].includes(parsed.action)) {
      
      // 对于需要task的操作，验证task字段
      if ((parsed.action === 'add' || parsed.action === 'complete' || parsed.action === 'delete') && 
          (!parsed.task || typeof parsed.task !== 'string' || parsed.task.trim() === '')) {
        return null;
      }
      
      return {
        action: parsed.action,
        task: parsed.task?.trim()
      };
    }
    
    return null;
  } catch (error) {
    console.warn('JSON解析失败:', error);
    return null;
  }
}

// 检查消息是否包含JSON操作
export function hasActionInMessage(message: string): boolean {
  return /\{[^}]*"action"[^}]*\}/.test(message);
} 