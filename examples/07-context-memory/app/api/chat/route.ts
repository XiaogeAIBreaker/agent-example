import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';

// 允许流式响应最长30秒
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
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

    // 构建系统提示词，增强上下文理解能力
    const systemPrompt = `你是一个智能待办事项助手，具有上下文记忆能力。你的主要任务是：

1. **理解用户的自然语言指令**，包括上下文引用
2. **解析上下文信息**，正确理解"刚才那个"、"最后一个"、"再加一个"等引用
3. **生成结构化的操作指令**，在回复中包含JSON格式的指令

## 支持的操作类型：
- \`add\`: 添加新任务
- \`complete\`: 完成任务
- \`delete\`: 删除任务
- \`list\`: 列出所有任务
- \`clear_completed\`: 清除已完成任务
- \`clear_all\`: 清除所有任务

## 上下文引用处理：
- "刚才那个/最后一个任务": 引用最近添加的任务
- "再加一个/再添加": 基于上次添加的任务类型
- "完成刚才的": 完成最近添加的任务
- "删除最后添加的": 删除最近添加的任务

## 响应格式：
每次回复都应该包含：
1. 友好的自然语言回复
2. 结构化的JSON指令（如果需要执行操作）

JSON指令格式：
\`\`\`json
{
  "action": "操作类型",
  "task": "任务内容或标识符",
  "response": "给用户的回复"
}
\`\`\`

## 示例对话：

用户："帮我添加一个学习Python的任务"
助手：好的，我来帮你添加一个学习Python的任务！
\`\`\`json
{
  "action": "add",
  "task": "学习Python",
  "response": "已添加任务：学习Python"
}
\`\`\`

用户："再加一个类似的任务"
助手：我来为你添加另一个学习相关的任务！
\`\`\`json
{
  "action": "add", 
  "task": "学习JavaScript",
  "response": "已添加类似任务：学习JavaScript"
}
\`\`\`

用户："完成刚才那个任务"
助手：好的，我来完成最近添加的任务！
\`\`\`json
{
  "action": "complete",
  "task": "学习JavaScript",
  "response": "已完成任务：学习JavaScript"
}
\`\`\`

## 重要提醒：
- 仔细分析用户消息中的上下文信息
- 如果有"引用的任务ID"等额外信息，优先使用ID进行操作
- 对于模糊的引用，要基于历史上下文做出合理判断
- 始终保持友好和准确的回复`;

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务暂时不可用，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 