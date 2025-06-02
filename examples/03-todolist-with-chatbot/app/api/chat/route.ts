import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// 允许流式响应最长30秒
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 检查 DeepSeek API key
  if (!process.env.DEEPSEEK_API_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'DeepSeek API key 未配置。请在 .env.local 文件中设置 DEEPSEEK_API_KEY' 
      }),
      { status: 500 }
    );
  }

  // 创建 DeepSeek provider 实例
  const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  // 只使用最后一条消息
  const lastMessage = messages[messages.length - 1];
  const singleMessage = lastMessage ? [lastMessage] : [];

  // 使用 DeepSeek API
  const result = streamText({
    model: deepseek('deepseek-chat'),
    messages: singleMessage,
  });

  return result.toDataStreamResponse();
} 