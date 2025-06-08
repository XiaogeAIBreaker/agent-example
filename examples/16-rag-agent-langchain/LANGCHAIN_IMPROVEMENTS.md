# LangChain 优化改进说明

## 从 15-rag-agent 到 16-rag-agent-langchain 的升级

基于教学案例15-rag-agent，我们引入LangChain来优化Prompt管理，实现更清晰、更模块化的提示词构建。

## 🎯 改进目标

| 目标 | 实现方式 | 价值 |
|------|---------|------|
| **Prompt 模板维护更清晰** | 用 LangChain `ChatPromptTemplate` 替换字符串拼接 | 提高可维护性和可读性 |
| **Few-shot 示例管理更模块化** | 用 `SystemMessagePromptTemplate` 统一管理 | 便于示例的增删改查 |
| **为未来扩展做准备** | 保持 `@vercel/ai-sdk` 执行逻辑不变 | 可轻松引入 LangChain memory/retriever |

## 🔧 具体改动

### 1. 新增依赖
```bash
npm install @langchain/core langchain
```

### 2. 新增文件：`app/utils/promptBuilder.ts`
- 使用 `ChatPromptTemplate.fromPromptMessages()` 构建提示词模板
- 将原来的长字符串提示词封装为函数 `getSystemPromptTemplate()`
- 提供 `buildPrompt()` 函数返回格式化的消息数组

### 3. 修改文件：`app/api/chat/route.ts`
**核心变更：**
```typescript
// 旧版本：字符串拼接
const systemPrompt = `你是一个具备透明化思考能力的智能任务助手...${ragContext}`;
const systemMessage = { role: 'system', content: systemPrompt };

// 新版本：LangChain模板化
const formattedMessages = await buildPrompt({ userMessage, ragContext });
const langchainSystemMessage = {
  role: 'system',
  content: typeof formattedMessages[0].content === 'string' 
    ? formattedMessages[0].content 
    : formattedMessages[0].content.toString()
};
```

## ✅ 保持不变的部分

- **Agent执行引擎**: 继续使用 `@vercel/ai-sdk` 的 `streamText()`
- **工具系统**: 完全保持原有的6个工具定义和执行逻辑
- **RAG检索**: VectorService 和 RagService 逻辑不变
- **Token管理**: 继续使用原有的token裁剪逻辑
- **业务逻辑**: Todo管理、CoT思维链等核心功能不变

## 🚀 使用方法

启动项目：
```bash
cd examples/16-rag-agent-langchain
npm run dev
```

访问 http://localhost:3000 体验优化后的提示词管理效果。

## 📈 未来扩展方向

通过这次重构，为以下扩展打下基础：
- **LangChain Memory**: 可以引入对话记忆管理
- **LangChain Retriever**: 可以替换现有的RAG实现
- **LangChain Agents**: 可以使用LangChain的Agent框架
- **Prompt模板库**: 可以建立可复用的提示词模板库

## 💡 核心思想

**最小改动 + 最大价值** = LangChain负责Prompt构造，@vercel/ai-sdk负责执行 