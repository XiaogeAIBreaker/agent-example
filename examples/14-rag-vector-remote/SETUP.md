# RAG 向量数据库配置指南

## 📋 环境变量配置

请在项目根目录创建 `.env` 文件，并添加以下配置：

```env
# Supabase 配置
SUPABASE_URL=你的_supabase_项目_url
SUPABASE_KEY=你的_supabase_anon_密钥
```

## 🗄️ Supabase 数据库设置

### 1. 创建表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 启用向量扩展
create extension if not exists vector;

-- 创建 todo_vectors 表
create table todo_vectors (
  id bigserial primary key,
  task text not null,
  embedding vector(512), -- Universal Sentence Encoder 生成 512 维向量
  priority text,
  due date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建向量索引以提高查询性能
create index on todo_vectors using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 2. 创建匹配函数

```sql
-- 创建向量相似度匹配函数
create or replace function match_todo_vector (
  query_embedding vector(512),
  match_count int default 5
) returns table (
  id bigint,
  task text,
  priority text,
  due date,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    todo_vectors.id,
    todo_vectors.task,
    todo_vectors.priority,
    todo_vectors.due,
    1 - (todo_vectors.embedding <=> query_embedding) as similarity
  from todo_vectors
  order by todo_vectors.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## 🚀 使用方法

### 上传数据到 Supabase

```bash
node scripts/uploadToSupabase.mjs
```

### 从 Supabase 检索数据

```bash
node scripts/searchFromSupabase.mjs
```

## 📝 注意事项

1. 确保已正确配置 `.env` 文件中的 Supabase 凭据
2. 首次运行脚本时，TensorFlow 模型需要下载，可能需要一些时间
3. Universal Sentence Encoder 生成的向量维度是 512 维
4. 向量相似度使用余弦距离计算

## 🔧 故障排除

- 如果遇到 TensorFlow 加载问题，请确保 Node.js 版本兼容
- 如果向量搜索返回空结果，请检查数据库中是否有数据
- 确保 Supabase 项目已启用 vector 扩展 