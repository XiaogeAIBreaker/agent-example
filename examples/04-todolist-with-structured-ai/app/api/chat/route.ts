import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { safeParseJSON, hasActionInMessage } from '../../utils/jsonParser';

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

  // 系统提示，引导模型输出结构化 JSON
  const systemPrompt = `你是一个待办事项助手。请根据用户的输入，输出结构化的 JSON 响应。

支持的操作类型：
- "add": 添加新的待办事项
- "complete": 完成待办事项
- "delete": 删除待办事项  
- "list": 列出所有待办事项

输出格式：
{ "action": "操作类型", "task": "任务内容", "response": "回复内容" }


请确保输出的是有效的 JSON 格式。`;

  // 使用 DeepSeek API
  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: systemPrompt,
    messages,
    onFinish: async (completion) => {
      // 当流式响应完成后，解析 AI 返回的内容
      const aiResponse = completion.text;
      
      // 检查是否包含操作指令
      if (hasActionInMessage(aiResponse)) {
        const parsedAction = safeParseJSON(aiResponse);
        
        if (parsedAction) {
          console.log('解析到的操作:', parsedAction);
          
          // 根据操作类型执行相应的逻辑
          switch (parsedAction.action) {
            case 'add':
              console.log(`添加任务: ${parsedAction.task}`);
              // 这里可以添加数据库操作或其他业务逻辑
              break;
            case 'complete':
              console.log(`完成任务: ${parsedAction.task}`);
              // 这里可以添加数据库操作或其他业务逻辑
              break;
            case 'delete':
              console.log(`删除任务: ${parsedAction.task}`);
              // 这里可以添加数据库操作或其他业务逻辑
              break;
            case 'list':
              console.log('列出所有任务');
              // 这里可以添加数据库查询逻辑
              break;
            default:
              console.log('普通对话');
          }
        }
      }
    },
  });

  return result.toDataStreamResponse();
} 