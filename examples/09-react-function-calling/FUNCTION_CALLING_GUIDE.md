# Function Calling 使用指南

## 🎯 什么是 Function Calling？

Function Calling 是现代 AI 应用的核心机制，允许 AI 模型直接调用预定义的函数，而不是生成需要解析的文本指令。

### 传统方式 vs Function Calling

**传统方式（07示例）**：
```
用户: "添加学习任务"
AI: 生成JSON → {"action": "add", "task": "学习任务"}
前端: 解析JSON → 执行函数
```

**Function Calling（08示例）**：
```
用户: "添加学习任务"
AI: 直接调用 → addTodo({task: "学习任务"})
前端: 接收调用 → 执行函数
```

## 🛠️ 技术实现

### 1. API 层面的工具定义

在 `app/api/chat/route.ts` 中：

```typescript
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
    completeTodo: {
      description: 'Complete a todo task', 
      parameters: z.object({
        taskIdentifier: z.string().describe('Task ID or description')
      })
    }
    // ... 更多工具
  },
  toolChoice: 'auto'  // AI自动选择是否使用工具
});
```

### 2. 前端工具调用处理

在 `app/components/ChatSidebar.tsx` 中：

```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  onToolCall: async ({ toolCall }) => {
    // 将AI的工具调用映射到业务逻辑
    let instruction: Instruction;
    
    switch (toolCall.toolName) {
      case 'addTodo':
        instruction = {
          action: 'add',
          task: toolCall.args.task
        };
        break;
      case 'completeTodo':
        const id = parseInt(toolCall.args.taskIdentifier);
        instruction = {
          action: 'complete',
          ...(isNaN(id) ? { task: toolCall.args.taskIdentifier } : { id: id })
        };
        break;
      // ... 处理其他工具
    }
    
    // 执行业务逻辑
    const result = executeInstruction(instruction);
    
    // 返回结果给AI
    return result.message || '操作完成';
  }
});
```

## 🎮 支持的函数

### 1. addTodo - 添加任务
```typescript
// 调用方式
addTodo({
  task: "学习Python"
})

// 映射到
{
  action: 'add',
  task: '学习Python'
}
```

### 2. completeTodo - 完成任务
```typescript
// 通过ID完成
completeTodo({
  taskIdentifier: "123"
})

// 通过描述完成
completeTodo({
  taskIdentifier: "学习Python"
})
```

### 3. deleteTodo - 删除任务
```typescript
// 支持ID或描述
deleteTodo({
  taskIdentifier: "123"  // 或 "学习Python"
})
```

### 4. listTodos - 列出任务
```typescript
listTodos({})  // 无参数
```

### 5. clearCompleted - 清除已完成
```typescript
clearCompleted({})  // 无参数
```

### 6. clearAll - 清除所有
```typescript
clearAll({})  // 无参数
```

## 🔍 核心优势

### 1. 类型安全
- 使用 Zod 定义参数 schema
- 自动验证参数类型和格式
- 编译时类型检查

### 2. 更好的AI理解
- AI 原生理解函数概念
- 不需要学习特定的JSON格式
- 更准确的意图识别

### 3. 简化错误处理
- 参数验证自动化
- 类型错误自动捕获
- 更清晰的错误信息

### 4. 易于扩展
- 添加新工具只需定义schema
- 不需要修改解析逻辑
- 支持复杂参数结构

## 🚀 上下文处理

### 智能引用解析
Function Calling 配合上下文记忆，支持：

```
用户: "添加学习Python任务"
AI: 调用 addTodo({task: "学习Python"})

用户: "完成刚才那个"
AI: 调用 completeTodo({taskIdentifier: "学习Python"})

用户: "再加一个类似的"
AI: 调用 addTodo({task: "学习JavaScript"})
```

### 上下文信息来源
1. **执行结果记录**: 从成功的操作中提取信息
2. **Tool Call历史**: 从AI的工具调用中获取上下文
3. **智能推理**: AI基于对话历史做出判断

## 🎓 最佳实践

### 1. 工具设计原则
- **单一职责**: 每个工具只做一件事
- **清晰描述**: 提供准确的工具和参数描述
- **灵活参数**: 支持多种输入方式（ID/文本）

### 2. 错误处理
```typescript
onToolCall: async ({ toolCall }) => {
  try {
    const result = executeInstruction(instruction);
    return result.success ? result.message : `操作失败: ${result.message}`;
  } catch (error) {
    return `执行错误: ${error.message}`;
  }
}
```

### 3. 性能优化
- 合理设置 `toolChoice`
- 避免过多的工具定义
- 优化参数验证逻辑

## 🔧 调试技巧

### 1. 查看工具调用日志
```typescript
onToolCall: async ({ toolCall }) => {
  console.log('Tool call received:', toolCall);
  // 处理逻辑...
}
```

### 2. 验证参数格式
```typescript
// 在API中添加日志
console.log('Available tools:', Object.keys(tools));
```

### 3. 测试工具定义
创建简单的测试脚本验证 schema 定义：

```javascript
const { z } = require('zod');

const schema = z.object({
  task: z.string().describe('The task content')
});

console.log(schema.parse({ task: "测试任务" }));
```

## 🚧 扩展方向

### 1. 添加更多工具类型
- 文件操作工具
- 计算工具
- 搜索工具
- 外部API调用

### 2. 工具组合
- 支持多步骤操作
- 工具链式调用
- 条件性工具执行

### 3. 高级功能
- 异步工具处理
- 工具权限控制
- 动态工具注册

这个指南展示了 Function Calling 的强大功能和实现细节，是现代 AI 应用开发的重要技术。 