import { createClient } from '@supabase/supabase-js';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';
import fs from 'fs';
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

  const tasks = JSON.parse(fs.readFileSync('./data/tasks.json', 'utf-8'));
  console.log(`📋 读取到 ${tasks.length} 个任务`);

  for (const task of tasks) {
    try {
      const text = `任务名称：${task.name}。描述：${task.description}`;
      console.log(`🔄 处理任务：${task.name}`);
      
      // 获取向量表示
      const embeddings = await model.embed([text]);
      const fullEmbedding = Array.from(await embeddings.data());
      
      // 截取前384维以匹配数据库配置
      const embedding = fullEmbedding.slice(0, 384);
      console.log(`📐 向量维度：${embedding.length}`);

      const { error } = await supabase.from('todo_vectors').insert({
        task: text,
        embedding,
        priority: task.priority,
        due: task.due
      });

      if (error) {
        console.error('❌ 插入失败：', task.name, error);
      } else {
        console.log('✅ 插入成功：', task.name);
      }
    } catch (error) {
      console.error('❌ 处理任务失败：', task.name, error);
    }
  }
  
  console.log('🎉 所有任务处理完成');
};

run().catch(console.error); 