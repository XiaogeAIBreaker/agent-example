// 服务端Token工具 - 仅用于API路由
type Message = {
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
};

// 备用的token估算方法（基于字符数的粗略估算）
function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // 粗略估算：中文字符约1.5 tokens，英文单词约1 token
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = text.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word)).length;
  const otherChars = text.length - chineseChars;
  
  return Math.ceil(chineseChars * 1.5 + englishWords * 1.2 + otherChars * 0.3);
}

// 服务端版本：同步Token估算（用于API路由）
export function getTotalTokenCountSync(messages: Message[]): number {
  let totalTokens = 0;
  
  messages.forEach(msg => {
    // 跳过 'data' 类型的消息
    if (msg.role === 'data') return;
    totalTokens += estimateTokens(msg.content) + 4; // 使用估算方法
  });
  
  return totalTokens;
}

// 服务端版本：同步消息裁剪（用于API路由）
export function trimMessagesToTokenLimitSync(
  messages: Message[],
  maxTokens: number = 3000
): Message[] {
  let totalTokens = 0;
  const trimmed: Message[] = [];

  // 从后往前处理，保留最近消息
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    // 跳过 'data' 类型的消息，因为它们不包含文本内容
    if (msg.role === 'data') continue;
    
    const tokenCount = estimateTokens(msg.content) + 4; // 使用估算方法

    if (totalTokens + tokenCount > maxTokens) {
      break;
    }

    trimmed.unshift(msg); // 保留消息
    totalTokens += tokenCount;
  }

  return trimmed;
} 