-- 启用向量扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建知识库向量表
CREATE TABLE IF NOT EXISTS knowledge_vectors (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  title text not null,
  content text not null,
  keywords text[] not null,
  action text not null,
  embedding vector(384),
  created_at timestamptz default now()
);

-- 创建向量搜索函数
CREATE OR REPLACE FUNCTION match_knowledge_vector (
  query_embedding vector(384),
  match_count int default 5,
  similarity_threshold float default 0.3
) RETURNS TABLE (
  id uuid, 
  category text, 
  title text, 
  content text, 
  keywords text[], 
  action text, 
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id, 
    k.category, 
    k.title, 
    k.content, 
    k.keywords, 
    k.action,
    1 - (k.embedding <=> query_embedding) as similarity
  FROM knowledge_vectors k
  WHERE 1 - (k.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END; $$;

-- 创建索引提升搜索性能
CREATE INDEX IF NOT EXISTS knowledge_vectors_embedding_idx 
ON knowledge_vectors USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 创建用于查看函数的视图
CREATE OR REPLACE VIEW knowledge_search_function_info AS
SELECT 
  routine_name,
  routine_type, 
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'match_knowledge_vector'; 