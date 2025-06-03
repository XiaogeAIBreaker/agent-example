import { useMemo, useEffect, useState } from 'react';
import { getTotalTokenCountSync, getMessageTokenCount, isTiktokenAvailable } from '../utils/tokenTrimmerClient';

type Message = {
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
};

interface TokenStats {
  totalTokens: number;
  userTokens: number;
  assistantTokens: number;
  averageTokensPerMessage: number;
  isNearLimit: boolean;
  warningLevel: 'safe' | 'warning' | 'danger';
  isEstimated: boolean; // 指示是否使用估算方法
}

export function useTokenStats(
  messages: Message[],
  maxTokens: number = 3000
): TokenStats {
  const [preciseStats, setPreciseStats] = useState<TokenStats | null>(null);

  // 使用同步方法进行初始估算
  const estimatedStats = useMemo(() => {
    if (messages.length === 0) {
      return {
        totalTokens: 0,
        userTokens: 0,
        assistantTokens: 0,
        averageTokensPerMessage: 0,
        isNearLimit: false,
        warningLevel: 'safe' as const,
        isEstimated: true,
      };
    }

    const totalTokens = getTotalTokenCountSync(messages);
    
    let userTokens = 0;
    let assistantTokens = 0;
    
    messages.forEach(msg => {
      if (msg.role === 'data') return;
      
      // 使用同步估算方法
      const estimatedTokens = Math.ceil(msg.content.length * 0.3) + 4;
      
      if (msg.role === 'user') {
        userTokens += estimatedTokens;
      } else if (msg.role === 'assistant') {
        assistantTokens += estimatedTokens;
      }
    });

    const averageTokensPerMessage = totalTokens / messages.length;
    const usageRatio = totalTokens / maxTokens;
    
    let warningLevel: 'safe' | 'warning' | 'danger' = 'safe';
    if (usageRatio > 0.9) {
      warningLevel = 'danger';
    } else if (usageRatio > 0.75) {
      warningLevel = 'warning';
    }

    return {
      totalTokens,
      userTokens,
      assistantTokens,
      averageTokensPerMessage: Math.round(averageTokensPerMessage),
      isNearLimit: usageRatio > 0.8,
      warningLevel,
      isEstimated: true,
    };
  }, [messages, maxTokens]);

  // 在客户端尝试获取精确的Token统计
  useEffect(() => {
    if (typeof window === 'undefined' || messages.length === 0) {
      return;
    }

    async function calculatePreciseStats() {
      try {
        let userTokens = 0;
        let assistantTokens = 0;
        let totalTokens = 0;

        for (const msg of messages) {
          if (msg.role === 'data') continue;
          
          const tokenCount = await getMessageTokenCount(msg);
          totalTokens += tokenCount;
          
          if (msg.role === 'user') {
            userTokens += tokenCount;
          } else if (msg.role === 'assistant') {
            assistantTokens += tokenCount;
          }
        }

        const averageTokensPerMessage = totalTokens / messages.length;
        const usageRatio = totalTokens / maxTokens;
        
        let warningLevel: 'safe' | 'warning' | 'danger' = 'safe';
        if (usageRatio > 0.9) {
          warningLevel = 'danger';
        } else if (usageRatio > 0.75) {
          warningLevel = 'warning';
        }

        setPreciseStats({
          totalTokens,
          userTokens,
          assistantTokens,
          averageTokensPerMessage: Math.round(averageTokensPerMessage),
          isNearLimit: usageRatio > 0.8,
          warningLevel,
          isEstimated: !isTiktokenAvailable(),
        });
      } catch (error) {
        console.warn('精确Token计算失败，使用估算值:', error);
      }
    }

    calculatePreciseStats();
  }, [messages, maxTokens]);

  // 返回精确统计（如果可用）或估算统计
  return preciseStats || estimatedStats;
} 