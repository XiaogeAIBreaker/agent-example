# 06 - 简单上下文记忆

## 项目简介

这是一个支持 **上下文记忆** 的对话式智能体案例，演示如何通过 **保持完整对话历史** 来实现简单而有效的上下文记忆功能。

基于 `05.5-simple-instruction-execution` 的基础上，添加了上下文记忆能力，AI 能够理解诸如"再加一个"、"刚才那个"等引用。

## 🎯 核心目标

在简单指令执行的基础上，增加：

1. **上下文记忆**: 通过完整的 messages 历史实现记忆
2. **引用理解**: 理解"再加一个"、"刚才那个"等上下文引用
3. **记忆可视化**: 提供上下文信息的可视化展示
4. **智能交互**: 基于历史上下文的智能对话

## 💫 核心特性

### 🧠 简单记忆机制
- **完整历史**: 保持所有 messages 在数组中
- **发送历史**: 每次请求都发送完整对话历史给 AI
- **AI 理解**: AI 通过历史上下文理解引用含义

### 🔗 上下文引用支持
- **"再加一个"**: 基于最后添加的任务类型
- **"刚才那个"**: 引用最近的操作或任务
- **"最后添加的"**: 精确引用最后添加的任务
- **"清空所有"**: 基于历史理解清空操作

### 📱 双视图界面
- **对话视图**: 标准的聊天界面
- **上下文视图**: 展示记忆信息和操作历史

## 🚀 快速开始

### 1. 安装依赖
```bash
cd examples/06-simple-context-memory
npm install
```

### 2. 配置环境变量
创建 `.env.local` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动应用
```bash
npm run dev
```

访问 http://localhost:3000

## 📝 上下文记忆示例

### 基础对话记忆
```
用户: "添加学习JavaScript的任务"
AI: 好的！我来添加学习JavaScript的任务。
    ```json
    {
      "action": "add",
      "task": "学习JavaScript",
      "response": "已添加任务：学习JavaScript"
    }
    ```

用户: "再加一个类似的任务"  ← 上下文引用
AI: 我来再添加一个学习相关的任务！
    ```json
    {
      "action": "add",
      "task": "学习React",
      "response": "已添加类似任务：学习React"
    }
    ```
```

### 引用理解
```
用户: "刚才那个任务完成了吗？"
AI: 根据我们的对话，您最近添加的是"学习React"任务，这个任务还未完成。

用户: "列出所有任务"
AI: 让我为您列出当前的所有任务。
    ```json
    {
      "action": "list",
      "response": "当前任务列表"
    }
    ```
```

## 🏗️ 实现原理

### 1. 简单记忆机制
```typescript
// 使用 useChat 的默认行为
const { messages, ... } = useChat({
  api: '/api/chat',
  // messages 数组自动保持完整历史
});

// API 路由自动接收完整历史
export async function POST(req: Request) {
  const { messages } = await req.json(); // 包含所有历史消息
  
  const result = await streamText({
    model: deepseek('deepseek-chat'),
    system: systemPrompt,
    messages, // 发送完整历史给 AI
  });
}
```

### 2. 上下文解析
```typescript
// 从历史消息中提取最后添加的任务
const getLastAddedTask = () => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'assistant' && msg.content.includes('"action": "add"')) {
      const match = msg.content.match(/"task":\s*"([^"]+)"/);
      if (match) return match[1];
    }
  }
  return null;
};
```

### 3. AI 系统提示词增强
```typescript
const systemPrompt = `你是一个智能待办事项助手，具有上下文记忆能力。

## 上下文引用规则：
- "刚才/最后/最近添加的": 引用最近添加的任务
- "再加一个/再添加": 添加与上次类似的任务
- "清空/清除": 清空所有任务

请仔细分析对话历史，正确理解用户的引用意图。`;
```

## 🎨 界面设计

### 双视图切换
- **对话视图**: 标准聊天界面 + 执行结果显示
- **上下文视图**: 记忆信息可视化
  - 最后添加的任务
  - 最近操作历史
  - 对话统计信息
  - 快捷命令建议

### 上下文提示
- 头部显示最后添加的任务
- 消息计数器显示对话长度
- 智能的占位符提示

## 🌟 学习要点

### 1. 记忆实现对比

| 方法 | 复杂记忆系统 | 简单记忆系统 |
|------|-------------|-------------|
| **存储** | 专门的记忆数据库 | messages 数组 |
| **管理** | 复杂的记忆管理 | 自动历史保持 |
| **检索** | 智能记忆搜索 | 直接遍历历史 |
| **同步** | 手动记忆同步 | 自动随消息同步 |

### 2. 上下文理解方式
- **客户端解析**: 从 messages 中提取关键信息
- **AI 理解**: 通过完整历史理解上下文引用
- **结合使用**: 客户端提示 + AI 智能理解

### 3. 性能优化
- 保持 messages 数组长度合理（AI SDK 自动处理）
- 使用正则表达式快速解析历史
- 避免复杂的记忆管理逻辑

## 🔄 与其他案例的关系

```
05.5-simple-instruction-execution  ← 基础指令执行
        ↓ 添加记忆功能
06-simple-context-memory           ← 【当前案例】简单上下文记忆
        ↓ 复杂化
07-context-memory                  ← 完整的上下文记忆系统
```

## 💡 核心价值

1. **理解记忆的本质**: 记忆就是保持和利用历史信息
2. **简单而有效**: 通过 messages 历史实现强大的记忆功能
3. **AI 驱动**: 让 AI 来理解上下文，而不是硬编码规则
4. **可视化记忆**: 用户可以清晰看到 AI 的"记忆"内容

---

这个案例演示了如何用最简单的方法实现上下文记忆：**保持完整对话历史，让 AI 来理解上下文**。 