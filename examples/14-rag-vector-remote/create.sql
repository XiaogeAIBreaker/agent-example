-- 开启 pgvector
create extension if not exists vector;

-- 创建任务向量表
create table todo_vectors (
  id uuid default gen_random_uuid() primary key,
  task text,
  embedding vector(384), -- 与模型维度一致
  priority text,
  due date
);

-- 创建或更新 todo_vectors 表（384维向量）
CREATE TABLE IF NOT EXISTS todo_vectors (
  id bigserial primary key,
  task text not null,
  embedding vector(384), -- 384维向量以匹配当前数据
  priority text,
  due date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建向量索引以提高查询性能
CREATE INDEX IF NOT EXISTS todo_vectors_embedding_idx 
ON todo_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 修复函数返回类型不匹配问题
-- 删除旧函数
DROP FUNCTION IF EXISTS match_todo_vector(vector, int);

-- 重新创建函数，使用正确的uuid类型
CREATE OR REPLACE FUNCTION match_todo_vector (
  query_embedding vector(384),
  match_count int default 5
) RETURNS TABLE (
  id uuid,
  task text,
  priority text,
  due date,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    todo_vectors.id,
    todo_vectors.task,
    todo_vectors.priority,
    todo_vectors.due,
    1 - (todo_vectors.embedding <=> query_embedding) as similarity
  FROM todo_vectors
  ORDER BY todo_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;