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

  // 🔥 关键：只使用最后一条消息，实现无记忆模式
  const lastMessage = messages[messages.length - 1];
  const singleMessage = lastMessage ? [lastMessage] : [];

  console.log('🔥 无记忆模式：只处理最后一条消息', lastMessage?.content);

  // 更新系统提示，强调无记忆模式
  const systemPrompt = `你是一个智能待办事项助手，能够理解用户的自然语言指令并转换为结构化的操作指令。

你的任务是：
1. 分析用户输入的自然语言
2. 判断用户想要执行的操作类型
3. 输出结构化的JSON指令，这些指令将被映射到具体的函数执行

支持的操作类型：
- "add": 添加新的待办事项
- "complete": 完成待办事项（需要明确的任务ID或完整任务内容）
- "delete": 删除待办事项（需要明确的任务ID或完整任务内容） 
- "list": 列出所有待办事项
- "clear_completed": 清除已完成的任务
- "clear_all": 清除所有任务

输出格式要求：
{ "action": "操作类型", "task": "任务内容", "response": "给用户的回复" }

对于不同类型的指令：
- add: task字段包含要添加的任务内容
- complete/delete: task字段包含要操作的任务关键词或ID
- list/clear_completed/clear_all: 不需要task字段

重要提示：
- 如果识别到操作指令，必须输出有效的JSON格式
- 如果无法识别为待办事项操作，正常对话即可
- 输出的JSON会被系统解析并执行对应的本地函数
- response字段用于向用户说明你理解的操作意图

示例：
用户："帮我添加一个学习Python的任务"
输出：{ "action": "add", "task": "学习Python", "response": "好的，我来为你添加'学习Python'这个任务" }

用户："完成学习任务"  
输出：{ "action": "complete", "task": "学习", "response": "我来帮你完成包含'学习'关键词的任务" }

用户："删除刚才的任务"
输出：抱歉，我无法记住之前的对话内容。请明确告诉我要删除哪个任务，比如"删除学习任务"或提供任务ID。`;

  // 使用 DeepSeek API - 只传递单条消息
  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: systemPrompt,
    messages: singleMessage, // 🔥 关键：只传递最后一条消息
    onFinish: async (completion) => {
      // 当流式响应完成后，解析 AI 返回的内容
      const aiResponse = completion.text;
      
      // 检查是否包含操作指令
      if (hasActionInMessage(aiResponse)) {
        const parsedAction = safeParseJSON(aiResponse);
        
        if (parsedAction) {
          console.log('解析到的指令:', parsedAction);
          
          // 在响应中添加执行结果标记，让前端知道这是一个指令
          console.log(`[指令映射-无记忆模式] 操作类型: ${parsedAction.action}, 任务: ${parsedAction.task || 'N/A'}`);
          
          // 可以在这里添加日志记录或其他处理逻辑
          switch (parsedAction.action) {
            case 'add':
              console.log(`[指令映射-无记忆模式] 将添加任务: ${parsedAction.task}`);
              break;
            case 'complete':
              console.log(`[指令映射-无记忆模式] 将完成任务: ${parsedAction.task}`);
              break;
            case 'delete':
              console.log(`[指令映射-无记忆模式] 将删除任务: ${parsedAction.task}`);
              break;
            case 'list':
              console.log(`[指令映射-无记忆模式] 将列出所有任务`);
              break;
            case 'clear_completed':
              console.log(`[指令映射-无记忆模式] 将清除已完成任务`);
              break;
            case 'clear_all':
              console.log(`[指令映射-无记忆模式] 将清除所有任务`);
              break;
            default:
              console.log(`[指令映射-无记忆模式] 未知操作类型: ${parsedAction.action}`);
          }
        } else {
          console.log('JSON解析失败，作为普通对话处理');
        }
      } else {
        console.log('普通对话，无需执行指令映射');
      }
    },
  });

  return result.toDataStreamResponse();
} 