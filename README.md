# AI智能待办事项应用 - 渐进式教学案例

这是一个展示**AI应用开发演进过程**的教学项目，从基础的待办事项应用逐步发展到具有**Function Calling**功能的智能AI助手。

## 🎯 项目概述

本项目包含8个渐进式示例，展示了现代AI应用开发的完整演进路径：

1. **01-todolist**: 基础待办事项应用
2. **02-chatbot**: 集成AI聊天功能
3. **03-todolist-with-chatbot**: AI聊天 + 待办事项
4. **04-todolist-with-structured-ai**: 结构化AI操作
5. **05-simple-instruction-execution**: 简单指令执行
6. **06-simple-context-memory**: 上下文记忆
7. **07-enhanced-prompt**: 增强提示 + Token控制
8. **08-function-calling**: **Function Calling机制** ⭐

## 🚀 最新功能：Function Calling (08示例)

### 核心特性
- **原生Function Calling**: 使用AI SDK的原生工具调用机制
- **类型安全**: 通过Zod定义函数参数schema
- **智能映射**: AI自动选择合适的函数执行操作
- **上下文感知**: 支持"刚才那个"、"再加一个"等上下文引用

### 技术优势
```typescript
// 传统方式（07示例）
AI: 生成JSON → {"action": "add", "task": "学习Python"}
前端: 解析JSON → 执行函数

// Function Calling（08示例）
AI: 直接调用 → addTodo({task: "学习Python"})
前端: 接收调用 → 执行函数
```

### 支持的函数
- `addTodo`: 添加新任务
- `completeTodo`: 完成任务
- `deleteTodo`: 删除任务
- `listTodos`: 列出所有任务
- `clearCompleted`: 清除已完成任务
- `clearAll`: 清除所有任务

## 📚 学习路径

### 初级阶段 (01-04)
- 基础React应用开发
- AI聊天集成
- 结构化AI输出

### 中级阶段 (05-07)
- 指令映射系统
- 上下文记忆机制
- Token长度控制

### 高级阶段 (08)
- **Function Calling机制**
- 类型安全的AI工具
- 现代AI应用架构

## 🛠️ 技术栈

- **前端**: Next.js 15.3.2 + React 19
- **AI集成**: Vercel AI SDK + DeepSeek
- **类型安全**: TypeScript + Zod
- **样式**: Tailwind CSS
- **Function Calling**: 原生工具调用机制

## 🚀 快速开始

### 体验最新的Function Calling功能

```bash
# 进入08示例目录
cd examples/08-function-calling

# 安装依赖
npm install

# 配置API Key
cp env.example .env.local
# 编辑 .env.local 添加你的 DEEPSEEK_API_KEY

# 启动应用
npm run dev
```

### 测试Function Calling
```
用户: "帮我添加一个学习Python的任务"
AI: 调用 addTodo({task: "学习Python"})
系统: ✅ 已添加任务

用户: "完成刚才那个任务"
AI: 调用 completeTodo({taskIdentifier: "学习Python"})
系统: ✅ 任务已完成

用户: "再加一个类似的"
AI: 调用 addTodo({task: "学习JavaScript"})
系统: ✅ 已添加相关任务
```

## 📁 项目结构

```
examples/
├── 01-todolist/                    # 基础待办事项
├── 02-chatbot/                     # AI聊天机器人
├── 03-todolist-with-chatbot/       # 聊天+待办事项
├── 04-todolist-with-structured-ai/ # 结构化AI操作
├── 05-simple-instruction-execution/# 指令执行系统
├── 06-simple-context-memory/       # 上下文记忆
├── 07-enhanced-prompt/             # 增强提示+Token控制
└── 08-function-calling/            # Function Calling ⭐
    ├── app/
    │   ├── api/chat/route.ts       # Function Calling API
    │   ├── components/
    │   │   └── ChatSidebar.tsx     # 工具调用处理
    │   └── utils/
    │       └── instructionMapper.ts # 指令映射器
    ├── FUNCTION_CALLING_GUIDE.md   # 详细技术指南
    ├── QUICK_START.md              # 快速启动指南
    └── README.md                   # 功能说明
```

## 🎓 教学价值

### 核心学习点
1. **AI应用演进**: 从简单聊天到智能工具调用
2. **Function Calling**: 现代AI应用的核心机制
3. **类型安全**: 使用Zod确保参数类型安全
4. **上下文处理**: 智能的对话上下文管理
5. **错误处理**: 健壮的AI应用错误处理

### 技术对比

| 特性 | 传统方式 | Function Calling |
|------|----------|------------------|
| 指令格式 | JSON字符串 | 原生函数调用 |
| 类型安全 | 手动验证 | Zod自动验证 |
| AI理解 | 学习JSON格式 | 原生函数理解 |
| 扩展性 | 修改解析逻辑 | 添加工具定义 |
| 错误处理 | JSON解析错误 | 类型验证错误 |

## 🔍 版本演进

| 版本 | 核心功能 | 技术亮点 |
|------|----------|----------|
| 01 | 基础待办事项 | React基础 |
| 02 | AI聊天 | AI SDK集成 |
| 03 | 聊天+待办 | 组件组合 |
| 04 | 结构化AI | JSON指令 |
| 05 | 指令执行 | 映射系统 |
| 06 | 上下文记忆 | 状态管理 |
| 07 | Token控制 | 性能优化 |
| 08 | **Function Calling** | **现代AI架构** |

## 🚧 未来扩展

- 多模态Function Calling
- 异步工具处理
- 工具权限控制
- 动态工具注册
- 工具组合调用

## 📝 许可证

MIT License

---

🌟 **推荐从08示例开始体验最新的Function Calling功能！**