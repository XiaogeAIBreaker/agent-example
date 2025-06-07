import { createClient } from '@supabase/supabase-js';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const run = async () => {
  console.log('🔄 加载向量化模型...');
  const model = await use.load();
  console.log('✅ 模型加载完成');

  const query = '我最近有什么重要任务要完成？';
  console.log(`🔍 查询：${query}`);
  
  // 将查询向量化
  const queryEmbeddings = await model.embed([query]);
  const fullQueryEmbedding = Array.from(await queryEmbeddings.data());
  
  // 截取前384维以匹配数据库配置
  const queryEmbedding = fullQueryEmbedding.slice(0, 384);
  console.log(`📐 查询向量维度：${queryEmbedding.length}`);

  console.log('🔄 执行向量搜索...');
  
  // 调用 Supabase 的向量匹配函数
  const { data, error } = await supabase.rpc('match_todo_vector', {
    query_embedding: queryEmbedding,
    match_count: 3
  });

  if (error) {
    console.error('❌ 检索失败：', error);
  } else {
    console.log('🔍 检索结果：');
    console.log('==========================================');
    data.forEach((item, i) => {
      console.log(`${i + 1}. ${item.task}`);
      console.log(`   优先级：${item.priority}`);
      console.log(`   截止日期：${item.due}`);
      console.log(`   相似度分数：${item.similarity.toFixed(4)}`);
      console.log('------------------------------------------');
    });
  }
};

run().catch(console.error); 