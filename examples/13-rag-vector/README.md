# RAG 文档块向量化示例 (Node.js版)

## 📖 项目简介
这是一个使用 Node.js 构建的 RAG (Retrieval-Augmented Generation) 文档块向量化示例。项目演示了如何：

- 🔧 使用 JavaScript 构建 tasks.json 数据集
- 🤖 使用 @langchain/community + @langchain/core + sentence-transformers 来生成嵌入
- 💾 将嵌入向量存入 FAISS 本地数据库
- 🔍 保存为可供后续 RAG 查询使用的 .faiss 向量索引

## 📁 项目结构
```
rag-doc-chunk/
├── data/
│   └── tasks.json          # 示例任务数据
├── scripts/
│   ├── buildVectorIndex.mjs    # 构建向量索引脚本
│   └── queryVectorIndex.mjs    # 查询测试脚本
├── vector_store/           # 向量数据库存储目录 (运行后生成)
├── model-cache/            # 模型缓存目录 (运行后生成)
├── package.json
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 构建向量索引
```bash
npm run build
```

### 3. 测试向量检索
```bash
npm run query
```

### 4. 一键运行完整流程
```bash
npm start
```

## 🔧 核心技术栈

- **langchain**: 主要的 LangChain 框架
- **@langchain/community**: LangChain 社区模块，包含 FAISS 向量存储
- **@langchain/core**: LangChain 核心模块，提供文档抽象
- **sentence-transformers**: HuggingFace 嵌入模型的 Node.js 封装

## 📋 示例数据
项目包含 5 个示例任务，涵盖不同优先级和类型：
- 撰写项目周报 (高优先级)
- 联系客户安排演示 (中优先级)
- 代码重构优化 (中优先级)
- 用户反馈收集 (低优先级)
- 技术文档更新 (中优先级)

## 🔍 查询示例
内置了以下测试查询：
- "准备和客户开会需要做什么？"
- "有什么高优先级的任务？"
- "需要写什么文档？"
- "六月中旬有什么重要工作？"

## ⚙️ 自定义配置

### 更换嵌入模型
在脚本中修改 `modelName` 参数：
```javascript
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
  cacheFolder: './model-cache'
});
```

### 添加更多数据
编辑 `data/tasks.json` 文件，添加更多任务数据。

### 调整检索参数
在查询脚本中修改相似度搜索的数量：
```javascript
const results = await store.similaritySearch(query, 2); // 返回前2个最相似的结果
```

## 🚨 注意事项

1. **首次运行**: 第一次运行时会下载 HuggingFace 模型，可能需要较长时间
2. **模型缓存**: 模型会自动缓存在 `model-cache` 目录中
3. **Python 依赖**: sentence-transformers 底层可能需要 Python 环境
4. **替代方案**: 如需无 Python 依赖，可考虑使用 OpenAI Embedding API

## 🔧 故障排除

### 安装失败
如果依赖安装失败，尝试：
```bash
npm cache clean --force
npm install
```

### Python 环境问题
如果遇到 Python 相关错误，确保系统已安装 Python 3.7+，或考虑使用 OpenAI Embedding 替代。

### 模型下载慢
如果模型下载缓慢，可以手动设置 HuggingFace 镜像或使用代理。

## 📈 后续扩展

- 🌐 集成 Web 界面进行交互式查询
- 🔌 连接外部数据源 (数据库、API等)
- 🤖 结合 LLM 构建完整的 RAG 对话系统
- 📊 添加查询结果评分和排序
- 🔄 实现增量更新向量索引

## 📄 许可证
MIT License 