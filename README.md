# AI智能待办事项应用 - 渐进式教学案例

这是一个展示**AI应用开发演进过程**的教学项目，从基础的待办事项应用逐步发展到具有**Function Calling**和**智能Agent**功能的现代AI助手。

## 🎯 项目概述

本项目包含**13个渐进式示例**，展示了现代AI应用开发的完整演进路径：

1. **01-todolist**: 基础待办事项应用
2. **02-chatbot**: 集成AI聊天功能
3. **03-todolist-with-chatbot**: AI聊天 + 待办事项
4. **04-todolist-with-structured-ai**: 结构化AI操作
5. **05-simple-instruction-execution**: 简单指令执行
6. **06-simple-context-memory**: 上下文记忆
7. **07-enhanced-prompt**: 增强提示 + Token控制
8. **08-function-calling**: **Function Calling机制** ⭐
9. **09-react-function-calling**: **ReAct模式** ⭐⭐
10. **10-agent-loop**: **Agent Loop执行闭环** ⭐⭐⭐
11. **11-agent-cot**: **Chain of Thought思考过程** ⭐⭐⭐
12. **12-agent-fewshot**: **Few-shot学习** ⭐⭐⭐⭐
13. **13-rag-doc-chunk**: **RAG文档块向量化** ⭐⭐⭐⭐⭐

## 🚀 最新功能：智能Agent + RAG系列 (09-13示例)

### 🧠 Agent核心特性
- **ReAct模式**: 推理与行动的智能结合
- **执行闭环**: 多轮自主决策和执行
- **思考可视化**: Chain of Thought过程展示
- **Few-shot学习**: 多样化示例适应能力
- **RAG向量化**: 检索增强生成，文档语义检索

### 技术演进对比
```typescript
// 传统方式（07示例）
AI: 生成JSON → {"action": "add", "task": "学习Python"}
前端: 解析JSON → 执行函数

// Function Calling（08示例）
AI: 直接调用 → addTodo({task: "学习Python"})
前端: 接收调用 → 执行函数

// ReAct模式（09示例）
AI: 先思考 → "我需要添加任务，然后显示列表"
AI: 多步执行 → addTodo() → listTodos()

// Agent Loop（10示例）
AI: 循环决策 → 执行 → 判断 → 继续执行直到完成

// CoT + Few-shot（11-12示例）
AI: 显示思考过程 + 多样化表达理解

// RAG向量化（13示例）
数据: 文档块 → 向量嵌入 → FAISS存储
查询: 语义检索 → 智能过滤 → 精准匹配
```

### 支持的智能功能
- **复合指令处理**: "添加三个任务然后显示列表"
- **自主循环执行**: "把所有未完成任务都完成掉"
- **思考过程可视化**: 展示AI的决策推理过程
- **多样化表达适应**: 理解不同用户表达习惯
- **语义文档检索**: "有什么高优先级的任务？"智能过滤匹配

## 📚 学习路径

### 🎓 初级阶段 (01-04)
- 基础React应用开发
- AI聊天集成
- 结构化AI输出

### 🎓 中级阶段 (05-08)
- 指令映射系统
- 上下文记忆机制
- Token长度控制
- **Function Calling机制**

### 🎓 高级阶段 (09-12) - **智能Agent系列**
- **ReAct模式**: 推理与行动结合
- **Agent Loop**: 多轮自主执行闭环
- **Chain of Thought**: 思考过程可视化
- **Few-shot Learning**: 多样化示例学习

### 🎓 专家阶段 (13) - **RAG向量化系列**
- **文档块向量化**: 使用HuggingFace嵌入模型
- **FAISS向量存储**: 高效的相似度搜索
- **语义检索**: 中文语义理解和匹配
- **智能过滤**: 基于元数据的精准筛选

## 🛠️ 技术栈

### 核心技术
- **前端**: Next.js 14.2+ + React 18
- **AI集成**: Vercel AI SDK 3.4+ + DeepSeek
- **类型安全**: TypeScript 5+ + Zod 3.23+
- **样式**: Tailwind CSS 3.4+

### AI功能特性
- **Function Calling**: 原生工具调用机制
- **ReAct模式**: 推理链与行动链结合
- **Agent Loop**: 多轮自主决策执行
- **Chain of Thought**: 思考过程结构化输出
- **Few-shot Learning**: 多示例学习能力
- **RAG向量化**: LangChain + FAISS + HuggingFace嵌入

## 🚀 快速开始

### 体验最新的智能Agent功能

```bash
# 体验最新的RAG文档向量化
cd examples/13-rag-doc-chunk

# 或体验最高级的Few-shot Agent
cd examples/12-agent-fewshot

# 或体验Chain of Thought
cd examples/11-agent-cot

# 或体验Agent Loop
cd examples/10-agent-loop

# 安装依赖
npm install

# 对于RAG示例，直接运行
npm start

# 对于Agent示例，配置API Key
cp env.example .env.local
# 编辑 .env.local 添加你的 DEEPSEEK_API_KEY

# 启动应用
npm run dev
```

### 测试智能Agent功能
```
🔍 RAG文档向量化 (13示例)
查询: "有什么高优先级的任务？"
系统: 语义检索 → 智能过滤 → 只返回高优先级任务

🔥 Few-shot Agent (12示例)
用户: "记一下：买菜、做饭、洗碗，然后帮我整理一下任务"
AI: 🧠 思考过程 → 📋 执行计划 → ✅ 执行结果

🧠 Chain of Thought (11示例)  
用户: "分析当前任务，完成最重要的三个"
AI: 显示完整思考过程，然后执行多个操作

🔄 Agent Loop (10示例)
用户: "把所有未完成任务都完成掉"
AI: 自动循环执行直到目标达成

⚡ ReAct模式 (09示例)
用户: "添加学习任务，完成第一个，然后显示列表"
AI: 推理 → 行动 → 推理 → 行动
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
├── 08-function-calling/            # Function Calling ⭐
├── 09-react-function-calling/      # ReAct模式 ⭐⭐
├── 10-agent-loop/                  # Agent Loop执行闭环 ⭐⭐⭐
├── 11-agent-cot/                   # Chain of Thought ⭐⭐⭐
├── 12-agent-fewshot/              # Few-shot学习 ⭐⭐⭐⭐
│   ├── app/
│   │   ├── api/chat/route.ts       # 智能Agent API
│   │   ├── components/
│   │   │   └── ChatSidebar.tsx     # 思考过程展示
│   │   └── utils/
│   ├── FEWSHOT_GUIDE.md           # Few-shot技术指南
│   ├── QUICK_TEST_GUIDE.md        # 快速测试指南
│   └── README.md                   # 功能说明
└── 13-rag-doc-chunk/              # RAG文档块向量化 ⭐⭐⭐⭐⭐
    ├── data/
    │   └── tasks.json              # 示例任务数据
    ├── scripts/
    │   ├── buildVectorIndex.mjs    # 构建向量索引
    │   └── queryVectorIndex.mjs    # 智能检索查询
    ├── vector_store/               # FAISS向量数据库
    ├── package.json                # 项目配置
    └── README.md                   # RAG技术指南
```

## 🎓 教学价值

### 核心学习点
1. **AI应用演进**: 从简单聊天到智能Agent
2. **Function Calling**: 现代AI应用的核心机制
3. **ReAct模式**: 推理与行动的智能结合
4. **Agent Loop**: 多轮自主决策执行机制
5. **Chain of Thought**: 思考过程的结构化输出
6. **Few-shot Learning**: 多样化示例学习能力
7. **RAG向量化**: 检索增强生成的完整实现
8. **类型安全**: 使用Zod确保参数类型安全
9. **上下文处理**: 智能的对话上下文管理

### 技术演进对比

| 特性 | 传统方式 | Function Calling | ReAct模式 | Agent Loop | CoT + Few-shot | RAG向量化 |
|------|----------|------------------|-----------|------------|----------------|-----------|
| 指令格式 | JSON字符串 | 原生函数调用 | 多步推理 | 循环决策 | 结构化思考 | 语义查询 |
| AI理解 | 学习JSON格式 | 原生函数理解 | 复合指令理解 | 目标导向理解 | 多样化表达理解 | 文档语义理解 |
| 执行模式 | 单次解析 | 单次调用 | 多步串行 | 多轮循环 | 显式思考过程 | 向量检索 |
| 用户体验 | 结构化输入 | 自然语言 | 复合指令 | 高级目标 | 透明化决策 | 精准匹配 |
| 扩展性 | 修改解析逻辑 | 添加工具定义 | 增强推理能力 | 优化决策逻辑 | 丰富示例库 | 扩展文档库 |

## 🔍 版本演进历程

| 版本 | 核心功能 | 技术亮点 | 适用场景 |
|------|----------|----------|----------|
| 01-04 | 基础功能 | React + AI基础集成 | 学习AI应用开发基础 |
| 05-07 | 结构化AI | 指令映射 + 上下文记忆 | 理解AI应用架构 |
| 08 | Function Calling | 原生工具调用 | 现代AI应用标准 |
| 09 | ReAct模式 | 推理与行动结合 | 复合指令处理 |
| 10 | Agent Loop | 多轮自主执行 | 复杂目标完成 |
| 11 | Chain of Thought | 思考过程可视化 | 透明化AI决策 |
| 12 | Few-shot Learning | 多样化示例学习 | 鲁棒性AI应用 |
| 13 | RAG向量化 | LangChain + FAISS | 知识库检索系统 |

## 🚧 技术路线图

### 🎯 已完成功能
- ✅ 基础Function Calling机制
- ✅ ReAct推理行动模式  
- ✅ Agent多轮执行闭环
- ✅ Chain of Thought思考过程
- ✅ Few-shot多样化学习
- ✅ RAG文档向量化检索

### 🔮 未来扩展方向
- 🚀 多模态Function Calling
- 🚀 并行工具执行优化
- 🚀 动态工具注册机制
- 🚀 Agent权限控制系统
- 🚀 工具组合调用策略
- 🚀 长期记忆管理
- 🚀 多Agent协作框架
- 🚀 RAG + Agent融合
- 🚀 多模态RAG检索
- 🚀 实时向量更新

## 📊 功能特性矩阵

| 功能特性 | 08 | 09 | 10 | 11 | 12 | 13 |
|----------|----|----|----|----|----|----|
| Function Calling | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 复合指令处理 | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 多轮自主执行 | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| 思考过程可视化 | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| 多样化表达理解 | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 文档向量化 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 语义检索 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 智能过滤 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 类型安全验证 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 上下文感知 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📝 许可证

MIT License

---

🌟 **推荐学习路径**: 
- **初学者**: 从01示例开始，循序渐进
- **有经验者**: 直接体验08-Function Calling
- **高级开发者**: 重点关注09-12智能Agent系列
- **专家级**: 体验13-RAG向量化检索系统

🎯 **最新亮点**: 13-rag-doc-chunk 展示了完整的RAG文档向量化检索实现！