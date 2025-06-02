# 05.5 - 简单指令执行

## 项目简介

这是一个 **最小可用** 的对话式智能体案例，用于演示 **"输入自然语言 ➝ 输出 JSON 指令 ➝ 执行任务"** 的完整闭环。

这个案例位于 `05-instruction-mapping`（复杂指令映射）和 `06-context-memory`（上下文记忆）之间，作为学习过渡，帮助理解最基础的 AI 指令执行原理。

## 🎯 核心目标

构建一个最简单的智能助手，实现：

1. **自然语言输入**: 用户用中文说出需求
2. **AI 理解转换**: 转换为结构化 JSON 指令
3. **本地函数执行**: 根据指令执行相应操作
4. **实时结果反馈**: 立即显示执行结果

## 💫 核心特性

### ✨ 极简设计
- 只有 3 个基本操作：添加、列表、清空
- 无复杂的映射系统或历史记忆
- 专注于演示核心流程

### 🔄 完整闭环
```
用户输入 → AI理解 → JSON指令 → 函数执行 → 结果显示
    ↑                                           ↓
    ←────────── UI更新 ←──────────────────────←
```

### 📱 直观界面
- **左侧**: 实时任务列表 + 执行结果
- **右侧**: 对话界面 + 快捷按钮

## 🚀 快速开始

### 1. 安装依赖
```bash
cd examples/05.5-simple-instruction-execution
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

## 📝 使用示例

### 基础操作
```
用户: "帮我添加一个学习JavaScript的任务"
AI: 好的！我已经为您添加了任务。
    ```json
    {
      "action": "add",
      "task": "学习JavaScript",
      "response": "已添加任务：学习JavaScript"
    }
    ```
系统: 执行结果: 已添加任务：学习JavaScript
```

### 列出任务
```
用户: "显示我的所有任务"
AI: 当前的任务列表如下：
    ```json
    {
      "action": "list",
      "response": "已为您列出所有任务"
    }
    ```
系统: 执行结果: 当前任务：
      1. 学习JavaScript
```

### 清空任务
```
用户: "清空所有任务"
AI: 好的，我来清空所有任务。
    ```json
    {
      "action": "clear",
      "response": "已清空所有任务"
    }
    ```
系统: 执行结果: 已清空 1 个任务
```

## 🏗️ 项目结构

```
05.5-simple-instruction-execution/
├── app/
│   ├── api/chat/route.ts          # AI 聊天接口
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 主页面
│   └── globals.css                # 全局样式
├── components/
│   └── ChatSidebar.tsx            # 主要 UI 组件
├── utils/
│   └── instructionMapper.ts       # 指令解析和执行
├── package.json
└── README.md
```

## 🔧 核心代码解析

### 1. AI 接口 (`app/api/chat/route.ts`)
```typescript
// 核心系统提示词
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
\`\`\``
```

### 2. 指令解析器 (`utils/instructionMapper.ts`)
```typescript
// 解析 AI 返回的 JSON 指令
export function parseInstruction(message: string): Instruction | null {
  const match = message.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

// 执行指令
export function execute(instruction: Instruction): ExecutionResult {
  const { action, task } = instruction;
  if (action === 'add' && task) {
    todos.push(task);
    return { success: true, message: `已添加任务：${task}` };
  }
  // ... 其他操作
}
```

### 3. UI 组件 (`components/ChatSidebar.tsx`)
```typescript
// 关键的 onFinish 回调
onFinish: (message) => {
  const instruction = parseInstruction(message.content);
  if (instruction) {
    const result = execute(instruction);
    setLastResult(result.message);
    setTodos(getTodos());
  }
}
```

## 🎨 界面设计

### 分屏布局
- **左侧 (1/3)**: 任务列表 + 执行结果展示
- **右侧 (2/3)**: 聊天对话 + 输入框

### 快捷操作
提供预设的快捷按钮：
- "添加学习任务"
- "列出所有任务" 
- "清空任务"

## 🌟 学习要点

### 1. JSON 指令格式
```typescript
interface Instruction {
  action: string;    // 操作类型：add/list/clear
  task?: string;     // 任务内容（仅 add 时需要）
  response?: string; // AI 的回复消息
}
```

### 2. 执行流程
1. 用户输入自然语言
2. AI 解析并生成包含 JSON 的回复
3. 前端提取 JSON 指令
4. 调用对应的本地函数
5. 更新 UI 状态

### 3. 状态管理
- 使用简单的模块级变量存储任务
- React state 管理 UI 显示
- 每次操作后同步状态

## 🔄 与其他案例的关系

```
01-todolist              ← 纯前端待办应用
02-chatbot               ← 基础 AI 对话
03-todolist-with-chatbot ← AI + 待办结合
04-todolist-with-structured-ai ← 结构化输出
→ 05.5-simple-instruction-execution ← 【当前案例】简单指令执行
05-instruction-mapping   ← 复杂指令映射系统  
06-context-memory        ← 上下文记忆功能
```

## 🚧 有意简化的功能

为了保持案例的简单性，以下功能被有意省略：

- ❌ 复杂的指令映射器类
- ❌ 任务的完成/删除操作
- ❌ 持久化存储
- ❌ 上下文记忆
- ❌ 错误重试机制
- ❌ 批量操作
- ❌ 任务优先级

这些功能将在后续的 `05-instruction-mapping` 和 `06-context-memory` 案例中逐步引入。

## 💡 核心价值

1. **理解 AI 指令执行的最基本原理**
2. **掌握 JSON 解析和函数映射的技巧**  
3. **体验完整的用户交互闭环**
4. **为学习更复杂的案例打下基础**

---

这个案例专注于演示 **"AI 理解 → 结构化输出 → 本地执行"** 的核心概念，是理解智能体工作原理的重要基石。 