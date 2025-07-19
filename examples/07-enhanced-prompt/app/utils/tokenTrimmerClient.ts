'use client';

type Message = {
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
};

type TiktokenEncoder = {
  encode: (text: string) => Uint32Array;
  free: () => void;
};

let encoding: TiktokenEncoder | null = null;
let isInitialized = false;

// 动态导入tiktoken（仅在客户端）
async function initTiktoken(): Promise<TiktokenEncoder | null> {
  if (typeof window === 'undefined') {
    return null; // 服务端直接返回null
  }
  
  try {
    if (!isInitialized) {
      const tiktoken = await import('tiktoken');
      encoding = tiktoken.encoding_for_model('gpt-3.5-turbo');
      isInitialized = true;
    }
    return encoding;
  } catch (error) {
    console.warn('Tiktoken 加载失败，使用备用方案:', error);
    return null;
  }
}

// 备用的token估算方法（基于字符数的粗略估算）
function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // 粗略估算：中文字符约1.5 tokens，英文单词约1 token
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = text.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word)).length;
  const otherChars = text.length - chineseChars;
  
  return Math.ceil(chineseChars * 1.5 + englishWords * 1.2 + otherChars * 0.3);
}

// 计算单条消息的Token数量
export async function getMessageTokenCount(
  message: Message
): Promise<number> {
  // 跳过 'data' 类型的消息
  if (message.role === 'data') return 0;
  
  const enc = await initTiktoken();
  
  if (enc) {
    return enc.encode(message.content).length + 4; // buffer for metadata
  } else {
    return estimateTokens(message.content) + 4; // 使用估算方法
  }
}

// 计算消息数组的总Token数量
export async function getTotalTokenCount(
  messages: Message[]
): Promise<number> {
  const enc = await initTiktoken();
  
  let totalTokens = 0;
  
  for (const msg of messages) {
    // 跳过 'data' 类型的消息
    if (msg.role === 'data') continue;
    
    if (enc) {
      totalTokens += enc.encode(msg.content).length + 4; // buffer for metadata
    } else {
      totalTokens += estimateTokens(msg.content) + 4; // 使用估算方法
    }
  }
  
  return totalTokens;
}

// 同步版本（客户端备用）
export function getTotalTokenCountSync(messages: Message[]): number {
  let totalTokens = 0;
  
  messages.forEach(msg => {
    // 跳过 'data' 类型的消息
    if (msg.role === 'data') return;
    totalTokens += estimateTokens(msg.content) + 4; // 使用估算方法
  });
  
  return totalTokens;
}

// 检查tiktoken是否可用
export function isTiktokenAvailable(): boolean {
  return typeof window !== 'undefined' && isInitialized;
} 