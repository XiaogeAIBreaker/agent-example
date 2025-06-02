import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key 未配置' }),
        { status: 500 }
      );
    }

    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // 增强的系统提示词，支持上下文记忆
    const systemPrompt = `你是一个智能待办事项助手，具有上下文记忆能力。你能理解用户对话历史中的引用。

## 核心功能：
1. **理解上下文引用**：理解"刚才那个"、"最后一个"、"再加一个"等引用
2. **生成结构化指令**：在回复中包含JSON格式的操作指令

## 支持的操作：
- \`add\`: 添加新任务
- \`list\`: 列出所有任务  
- \`clear\`: 清空所有任务

## 上下文引用规则：
- "刚才/最后/最近添加的": 引用最近添加的任务
- "再加一个/再添加": 添加与上次类似的任务
- "清空/清除": 清空所有任务

## 响应格式：
每次回复包含友好回复 + JSON指令（如需要）

\`\`\`json
{
  "action": "add|list|clear",
  "task": "任务内容",
  "response": "给用户的友好回复"
}
\`\`\`

## 示例：
用户："添加学习任务"
你：好的！我来添加学习任务。
\`\`\`json
{
  "action": "add",
  "task": "学习任务",
  "response": "已添加任务：学习任务"
}
\`\`\`

用户："再加一个"
你：我来再添加一个学习相关的任务！
\`\`\`json
{
  "action": "add",
  "task": "学习JavaScript",
  "response": "已添加类似任务：学习JavaScript"
}
\`\`\`

请仔细分析对话历史，正确理解用户的引用意图。`;

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ error: '服务暂时不可用' }),
      { status: 500 }
    );
  }
} 