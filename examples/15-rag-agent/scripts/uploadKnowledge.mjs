import { createClient } from '@supabase/supabase-js';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const run = async () => {
  console.log('🚀 开始RAG知识库上传流程...');
  
  // 检查环境变量
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ 请检查 .env.local 文件中的 SUPABASE_URL 和 SUPABASE_KEY 配置');
    process.exit(1);
  }

  console.log('🔄 加载向量化模型...');
  const model = await use.load();
  console.log('✅ Universal Sentence Encoder 模型加载完成');

  // 读取知识库数据
  const knowledgeFile = join(__dirname, '../data/knowledge-base.json');
  const knowledgeData = JSON.parse(fs.readFileSync(knowledgeFile, 'utf-8'));
  console.log(`📚 读取到 ${knowledgeData.length} 条知识条目`);

  let successCount = 0;
  let failCount = 0;

  for (const [index, item] of knowledgeData.entries()) {
    try {
      console.log(`\n🔄 处理第 ${index + 1}/${knowledgeData.length} 条: ${item.title}`);
      
      // 构造向量化文本
      const vectorText = `类别：${item.category}。标题：${item.title}。内容：${item.content}。关键词：${item.keywords.join('、')}`;
      
      console.log(`📝 向量化文本预览: ${vectorText.substring(0, 80)}...`);
      
      // 获取向量表示
      const embeddings = await model.embed([vectorText]);
      const fullEmbedding = Array.from(await embeddings.data());
      
      // 截取前384维以匹配数据库配置
      const embedding = fullEmbedding.slice(0, 384);
      console.log(`📐 向量维度: ${embedding.length}`);

      // 插入数据库
      const { error } = await supabase.from('knowledge_vectors').insert({
        category: item.category,
        title: item.title,
        content: item.content,
        keywords: item.keywords,
        action: item.action,
        embedding
      });

      if (error) {
        console.error(`❌ 插入失败: ${item.title}`, error.message);
        failCount++;
      } else {
        console.log(`✅ 插入成功: ${item.title}`);
        successCount++;
      }

      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ 处理失败: ${item.title}`, error.message);
      failCount++;
    }
  }
  
  console.log('\n🎉 知识库上传完成!');
  console.log(`✅ 成功: ${successCount} 条`);
  console.log(`❌ 失败: ${failCount} 条`);
  
  if (successCount > 0) {
    console.log('\n🔍 测试向量搜索功能...');
    await testVectorSearch();
  }
};

// 测试向量搜索
const testVectorSearch = async () => {
  try {
    const model = await use.load();
    const testQuery = '用户说记一下该怎么理解';
    
    console.log(`🔍 测试查询: "${testQuery}"`);
    
    const queryEmbeddings = await model.embed([testQuery]);
    const fullQueryEmbedding = Array.from(await queryEmbeddings.data());
    const queryEmbedding = fullQueryEmbedding.slice(0, 384);

    const { data, error } = await supabase.rpc('match_knowledge_vector', {
      query_embedding: queryEmbedding,
      match_count: 3,
      similarity_threshold: 0.1
    });

    if (error) {
      console.error('❌ 搜索测试失败:', error.message);
    } else {
      console.log('\n📋 搜索结果:');
      console.log('==========================================');
      data.forEach((item, i) => {
        console.log(`${i + 1}. 标题: ${item.title}`);
        console.log(`   类别: ${item.category}`);
        console.log(`   行动: ${item.action}`);
        console.log(`   相似度: ${item.similarity.toFixed(4)}`);
        console.log('------------------------------------------');
      });
    }
  } catch (error) {
    console.error('❌ 搜索测试异常:', error.message);
  }
};

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的Promise拒绝:', error);
  process.exit(1);
});

run().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
}); 