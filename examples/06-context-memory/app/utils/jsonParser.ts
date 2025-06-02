// 定义操作类型
export interface TodoAction {
  action: 'add' | 'complete' | 'delete' | 'list' | 'clear_completed' | 'clear_all';
  task?: string;
  response?: string;
}

// 安全解析JSON的函数
export function safeParseJSON(text: string): TodoAction | null {
  try {
    // 首先尝试提取markdown代码块中的JSON
    const codeBlockMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
    let jsonString = '';
    
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    } else {
      // 如果没有代码块，尝试直接提取JSON
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        return null;
      }
      jsonString = jsonMatch[0];
    }

    console.log('提取的JSON字符串:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    
    // 验证解析结果的结构
    if (typeof parsed === 'object' && 
        parsed !== null && 
        'action' in parsed &&
        ['add', 'complete', 'delete', 'list', 'clear_completed', 'clear_all'].includes(parsed.action)) {
      
      // 对于需要task的操作，验证task字段
      if ((parsed.action === 'add' || parsed.action === 'complete' || parsed.action === 'delete') && 
          (!parsed.task || typeof parsed.task !== 'string' || parsed.task.trim() === '')) {
        console.warn('操作需要task字段但未提供或为空');
        return null;
      }
      
      return {
        action: parsed.action,
        task: parsed.task?.trim(),
        response: parsed.response
      };
    }
    
    console.warn('JSON结构验证失败:', parsed);
    return null;
  } catch (error) {
    console.warn('JSON解析失败:', error);
    return null;
  }
}

// 检查消息是否包含JSON操作
export function hasActionInMessage(message: string): boolean {
  // 检查是否包含markdown代码块或直接的JSON
  return /```json[\s\S]*?```/.test(message) || /\{[\s\S]*?"action"[\s\S]*?\}/.test(message);
} 