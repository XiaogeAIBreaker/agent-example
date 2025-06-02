import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY! });

  const result = await streamText({
    model: deepseek('deepseek-chat'),
    system: `你是一个待办事项智能助手，用户会用自然语言告诉你任务。
你需要：
- 输出友好的回复
- 附带结构化 JSON 指令，例如：

\`\`\`json
{
  "action": "add",
  "task": "学习JavaScript",
  "response": "已添加任务：学习JavaScript"
}
\`\`\`

支持的操作类型：
- "add": 添加新任务 (需要 task 参数)
- "list": 列出所有任务
- "clear": 清空所有任务

请确保 JSON 格式正确，并包含在代码块中。`,
    messages,
  });

  return result.toDataStreamResponse();
} 