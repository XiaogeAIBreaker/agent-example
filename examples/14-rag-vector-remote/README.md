# 🚀 RAG 向量远程数据库示例 

> **Node.js + Supabase + TensorFlow 实现的智能语义搜索系统**

## 📖 项目简介

这是一个完整的 RAG (Retrieval-Augmented Generation) 向量数据库实现，展示了如何构建生产级的语义搜索系统：

- 🎯 **智能语义理解**: 使用 TensorFlow Universal Sentence Encoder 将文本转换为 384 维向量
- 🗄️ **云端向量存储**: 基于 Supabase PostgreSQL + pgvector 扩展的向量数据库
- 🔍 **高效相似度搜索**: 实现毫秒级的余弦相似度检索
- 🌐 **可扩展架构**: 支持大规模数据和高并发查询
- 💼 **实际应用场景**: 任务管理、文档检索、智能推荐等

## 📁 项目结构
```
rag-vector-remote/
├── 📄 data/
│   └── tasks.json              # 示例任务数据集 (6个任务)
├── 🛠️ scripts/
│   ├── uploadToSupabase.mjs    # 向量化并上传数据到 Supabase
│   └── searchFromSupabase.mjs  # 语义搜索和相似度检索
├── 🔧 .env                     # Supabase 连接配置 (需手动创建)
├── 📖 SETUP.md                 # 数据库配置详细指南
├── ⚙️ package.json             # 项目依赖和脚本
└── 📚 README.md                # 项目说明文档
```

## ✨ 核心特性

- 🧠 **智能向量化**: TensorFlow Universal Sentence Encoder 提供高质量的语义理解
- ⚡ **极速检索**: pgvector 的 IVFFLAT 索引支持毫秒级查询
- 🔄 **自动适配**: 自动处理向量维度匹配 (384维)
- 🎛️ **灵活配置**: 支持自定义搜索参数和结果数量
- 🚀 **生产就绪**: 完整的错误处理和性能优化

## 🚀 快速开始

### 步骤 1: 克隆并安装
```bash
# 进入项目目录
cd examples/14-rag-vector-remote

# 安装依赖
npm install
```

### 步骤 2: 配置 Supabase
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目根目录创建 `.env` 文件：
```env
SUPABASE_URL=https://你的项目id.supabase.co
SUPABASE_KEY=你的_anon_public_密钥
```

### 步骤 3: 初始化数据库
在 Supabase SQL 编辑器中执行以下代码：
```sql
-- 启用向量扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建表
CREATE TABLE todo_vectors (
  id uuid default gen_random_uuid() primary key,
  task text not null,
  embedding vector(384),
  priority text,
  due date,
  created_at timestamptz default now()
);

-- 创建搜索函数
CREATE OR REPLACE FUNCTION match_todo_vector (
  query_embedding vector(384),
  match_count int default 5
) RETURNS TABLE (
  id uuid, task text, priority text, due date, similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.task, t.priority, t.due,
         1 - (t.embedding <=> query_embedding) as similarity
  FROM todo_vectors t
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END; $$;
```

### 步骤 4: 上传和搜索
```bash
# 向量化并上传数据
npm run upload

# 执行语义搜索
npm run search
```

### 🎉 完成！
你应该能看到类似这样的搜索结果：
```
🔍 检索结果：
1. 任务名称：代码重构优化。描述：优化核心模块...
   优先级：中 | 截止日期：2025-06-15 | 相似度：0.5792
```

## 🔧 技术栈

| 组件 | 技术选型 | 作用 |
|------|---------|------|
| 🧠 **AI模型** | TensorFlow Universal Sentence Encoder | 将文本转换为384维语义向量 |
| 🗄️ **数据库** | Supabase PostgreSQL + pgvector | 云端向量存储和相似度搜索 |
| ⚡ **运行时** | Node.js + JavaScript ES模块 | 高性能的异步处理 |
| 🔌 **客户端** | @supabase/supabase-js | 数据库连接和RPC调用 |
| 🎯 **索引** | IVFFLAT (pgvector) | 快速近似最近邻搜索 |

### 📊 性能指标
- **向量维度**: 384维 (384个浮点数)
- **搜索延迟**: < 50ms (取决于数据量)
- **相似度算法**: 余弦距离 (Cosine Distance)
- **索引类型**: IVFFLAT (适合中等规模数据)

## 📋 示例数据

项目包含 6 个真实的任务场景，展示不同类型的工作内容：

| 任务 | 优先级 | 截止日期 | 类型 |
|------|--------|----------|------|
| 📝 撰写项目周报 | 高 | 2025-06-10 | 文档工作 |
| 📊 撰写报表 | 低 | 2025-06-10 | 数据分析 |
| 👥 联系客户安排演示 | 中 | 2025-06-08 | 客户关系 |
| 🔧 代码重构优化 | 中 | 2025-06-15 | 技术开发 |
| 💬 用户反馈收集 | 低 | 2025-06-12 | 产品研究 |
| 📖 技术文档更新 | 中 | 2025-06-18 | 文档工作 |

## 🔍 智能搜索示例

### 语义搜索演示
```javascript
// 查询: "我最近有什么重要任务要完成？"
// 系统会自动理解"重要"、"最近"等语义，返回相关任务

// 测试其他查询场景:
"准备客户会议需要做什么？"     // → 联系客户安排演示
"有什么高优先级的工作？"       // → 撰写项目周报  
"需要写哪些文档？"           // → 技术文档更新、项目周报
"六月中旬有什么任务？"        // → 代码重构优化、技术文档更新
```

### 自定义查询
修改 `scripts/searchFromSupabase.mjs` 第18行：
```javascript
const query = '你的自定义查询'; // 支持中文语义搜索
```

## ⚙️ 高级配置

### 🎛️ 搜索参数调优
```javascript
// 在 searchFromSupabase.mjs 中调整
const { data, error } = await supabase.rpc('match_todo_vector', {
  query_embedding: queryEmbedding,
  match_count: 10,        // 返回结果数量 (1-100)
});
```

### 📚 添加自定义数据
1. **编辑数据文件**: 修改 `data/tasks.json`
```json
{
  "name": "新任务名称",
  "description": "详细的任务描述",
  "priority": "高|中|低", 
  "due": "2025-MM-DD"
}
```

2. **重新上传**: `npm run upload`

### 🔧 数据库优化
```sql
-- 调整索引参数 (在 Supabase SQL 编辑器中)
DROP INDEX IF EXISTS todo_vectors_embedding_idx;
CREATE INDEX todo_vectors_embedding_idx 
ON todo_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 200); -- 增加 lists 数量提升精度
```

### 🎯 向量维度说明
- **384维**: 当前配置，平衡性能和精度
- **512维**: 更高精度，需修改数据库表定义
- **1536维**: OpenAI 标准，适合大规模应用

## ⚠️ 重要说明

### 🕒 首次运行
- TensorFlow 模型下载: ~100MB，需要 2-5 分钟
- 模型会自动缓存到本地，后续运行更快
- 确保网络连接稳定

### 🔑 环境要求
- **Node.js**: 16+ (推荐 18+)
- **网络**: 需要访问 Supabase 和 TensorFlow Hub
- **Supabase**: 免费版支持 500MB 数据库

## 🚨 常见问题解决

| 问题 | 错误信息 | 解决方案 |
|------|----------|----------|
| 🔧 **函数未找到** | `PGRST202` | 在 Supabase 中执行步骤3的SQL代码 |
| 🔑 **认证失败** | `supabaseKey is required` | 检查 `.env` 文件配置 |
| 📐 **维度不匹配** | `expected 384 dimensions` | 向量维度已自动处理为384维 |
| 🌐 **网络超时** | `model download failed` | 检查网络连接，重试运行 |
| 💾 **数据为空** | `no results found` | 先运行 `npm run upload` 上传数据 |

### 🛠️ 详细排错步骤

<details>
<summary>点击展开调试指南</summary>

#### 1. 验证 Supabase 连接
```bash
# 创建测试脚本
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
console.log('Supabase connected:', !!supabase);
"
```

#### 2. 检查数据库函数
```sql
-- 在 Supabase SQL 编辑器中查询
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'match_todo_vector';
```

#### 3. 测试向量搜索
```bash
# 使用调试模式
DEBUG=* npm run search
```

</details>

## 🚀 扩展应用场景

### 💼 企业级应用
- **智能客服**: 基于知识库的自动问答
- **文档检索**: 企业内部文档智能搜索  
- **产品推荐**: 基于用户描述的商品匹配
- **代码搜索**: 语义化的代码片段检索

### 🔧 技术扩展方向
- 🌐 **Web界面**: React/Vue + REST API
- 📱 **移动端**: React Native / Flutter 集成
- 🤖 **AI对话**: 结合 GPT/Claude 构建智能助手
- 📊 **分析仪表板**: 搜索行为分析和优化
- 🔄 **实时同步**: WebSocket 实时数据更新
- 🎯 **多模态**: 支持图片、音频向量化

### 📚 学习资源
- [Supabase Vector 官方文档](https://supabase.com/docs/guides/database/extensions/pgvector)
- [TensorFlow.js 模型库](https://www.tensorflow.org/js/models)
- [向量数据库最佳实践](https://www.pinecone.io/learn/)

---

## 📞 反馈与支持

- 🐛 **发现问题**: [提交 Issue](https://github.com/your-repo/issues)
- 💡 **功能建议**: [讨论区](https://github.com/your-repo/discussions)  
- 📧 **技术支持**: your-email@domain.com

**⭐ 如果这个项目对你有帮助，请给个星标支持！**

## 📄 许可证
MIT License - 自由使用和修改 