# 08-function-calling：Function Calling 智能待办事项

这是一个展示 **Function Calling** 机制的智能待办事项应用，取代了传统的结构化JSON指令解析方式。

## 🎯 核心功能

### Function Calling 机制
- 使用 `@ai-sdk/react` 的原生 Function Calling 支持
- 通过 `onToolCall` 处理函数调用
- 使用 `zod` 定义函数参数 schema
- 自动解析和执行 AI 选择的函数

### 支持的函数
1. **addTodo** - 添加新任务
2. **completeTodo** - 完成任务  
3. **deleteTodo** - 删除任务
4. **listTodos** - 列出所有任务
5. **clearCompleted** - 清除已完成任务
6. **clearAll** - 清除所有任务

## 🚀 主要改进（相比07示例）

### 1. 从结构化JSON到Function Calling
**之前 (07示例)**：
```javascript
// AI需要生成JSON格式指令
{
  "action": "add",
  "task": "学习Python",
  "response": "已添加任务：学习Python"
}

// 前端解析JSON并执行
const result = parseAndExecuteMessage(message.content);
```

**现在 (08示例)**：
```javascript
// API中定义工具
tools: {
  addTodo: {
    description: 'Add a new todo task',
    parameters: z.object({
      task: z.string().describe('The task content')
    })
  }
}

// 前端直接处理工具调用
onToolCall: async ({ toolCall }) => {
  const instruction = { action: 'add', task: toolCall.args.task };
  return executeInstruction(instruction);
}
```

### 2. 更智能的参数处理
- AI自动选择合适的函数
- 类型安全的参数验证（通过zod）
- 自动的ID/文本识别处理

### 3. 改进的上下文处理
- 从执行结果中提取上下文信息
- 支持从tool calls中获取历史操作
- 更准确的上下文引用解析

## 🛠️ 技术实现

### API层面 (`app/api/chat/route.ts`)
```typescript
// 定义工具集
const result = await streamText({
  model: deepseek('deepseek-chat'),
  messages: trimmedMessages,
  tools: {
    addTodo: {
      description: 'Add a new todo task',
      parameters: z.object({
        task: z.string().describe('The task content')
      })
    },
    // ... 其他工具
  },
  toolChoice: 'auto'
});
```

### 前端处理 (`app/components/ChatSidebar.tsx`)
```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  onToolCall: async ({ toolCall }) => {
    // 映射tool call到instruction
    const instruction = mapToolCallToInstruction(toolCall);
    
    // 执行指令
    const result = executeInstruction(instruction);
    
    // 返回结果给AI
    return result.message;
  }
});
```

## 📦 依赖和环境

### 新增依赖
```json
{
  "zod": "^3.22.4"  // 用于函数参数schema定义
}
```

### 环境配置
```bash
# 需要配置DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 🎮 使用方式

### 启动应用
```bash
cd examples/08-function-calling
npm install
npm run dev
```

### 交互示例
```
用户: "帮我添加一个学习Python的任务"
AI: 调用 addTodo({task: "学习Python"})
系统: 执行添加操作
AI: "好的，我已经为你添加了"学习Python"这个任务！"

用户: "完成刚才那个任务"  
AI: 调用 completeTodo({taskIdentifier: "学习Python"})
系统: 执行完成操作
AI: "已经完成了"学习Python"任务！"
```

## 🔍 关键差异对比

| 特性 | 07-enhanced-prompt | 08-function-calling |
|------|-------------------|-------------------|
| 指令格式 | 结构化JSON | Function Calling |
| 解析方式 | 正则表达式匹配 | 原生工具调用 |
| 类型安全 | 手动验证 | Zod自动验证 |
| AI理解 | 需要学习JSON格式 | 原生函数理解 |
| 错误处理 | JSON解析错误 | 类型验证错误 |
| 扩展性 | 修改解析逻辑 | 添加工具定义 |

## 🎓 学习重点

1. **Function Calling概念**：理解AI如何选择和调用函数
2. **Zod Schema**：学习如何定义类型安全的参数
3. **工具映射**：了解如何将AI工具调用映射到业务逻辑
4. **错误处理**：掌握函数调用的错误处理机制
5. **上下文维护**：在Function Calling中维护对话上下文

## 🚧 扩展思路

1. **添加更多工具**：文件操作、计算、搜索等
2. **工具组合**：支持多步骤操作
3. **条件执行**：基于上下文的条件性工具调用
4. **异步工具**：支持耗时操作的异步处理
5. **工具权限**：不同场景下的工具访问控制

这个示例展示了从传统指令解析到现代Function Calling的演进，体现了AI应用开发的最新趋势。
