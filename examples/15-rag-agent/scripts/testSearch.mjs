import { createClient } from '@supabase/supabase-js';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import '@tensorflow/tfjs-node';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 关键词提取函数
function extractKeywords(text) {
  const keywordMap = {
    '记': ['记一下', '记录', '提醒'],
    'mark': ['mark', '标记', '记住'],
    '心情': ['心情', '情绪', '感受'],
    '不好': ['不好', '难受', '低落'],
    '安排': ['安排', '管理', '计划'],
    '忘记': ['忘记', '遗忘', '别忘了'],
    '做': ['做', '任务', '事情']
  };
  
  const keywords = [];
  for (const [key, values] of Object.entries(keywordMap)) {
    if (values.some(word => text.includes(word))) {
      keywords.push(key);
    }
  }
  
  // 如果没有找到关键词，提取一些基础词汇
  if (keywords.length === 0) {
    const basicWords = text.match(/[\u4e00-\u9fa5]+/g) || [];
    keywords.push(...basicWords.slice(0, 3));
  }
  
  return keywords;
}

// 单个查询测试函数
async function testSingleQuery(queryText, queryEmbedding, method) {
  console.log(`📊 ${method} - 向量维度: ${queryEmbedding.length}`);
  
  // 使用数据库向量搜索
  const vectorString = `[${queryEmbedding.join(',')}]`;
          const { data: results, error } = await supabase
    .rpc('match_knowledge_vector', {
      query_embedding: vectorString,
      match_count: 5,
      similarity_threshold: 0.1  // 降低阈值
    });
  
  // 如果仍然没有结果，尝试最低阈值
  if (!results || results.length === 0) {
    const { data: lowResults, error: lowError } = await supabase
      .rpc('match_knowledge_vector', {
        query_embedding: vectorString,
        match_count: 5,
        similarity_threshold: 0.0
      });
    
    if (!lowError && lowResults && lowResults.length > 0) {
      console.log(`    🔬 使用0.0阈值找到 ${lowResults.length} 条结果:`);
      lowResults.forEach((result, i) => {
        console.log(`      ${i+1}. ${result.title} (相似度: ${(result.similarity * 100).toFixed(2)}%)`);
      });
    }
  }

  if (error) {
    console.error(`❌ ${method}失败:`, error.message);
  } else if (!results || results.length === 0) {
    console.log(`⚠️ ${method}没有找到相关知识`);
  } else {
    console.log(`✅ ${method}找到 ${results.length} 条相关知识:`);
    results.forEach((result, i) => {
      console.log(`    ${i+1}. ${result.title} (相似度: ${(result.similarity * 100).toFixed(1)}%)`);
      console.log(`       类别: ${result.category}`);
      console.log(`       建议行动: ${result.action}`);
    });
  }
}

async function testSearch() {
  console.log('🔍 测试RAG知识搜索功能...\n');

  try {
    // 1. 加载向量化模型
    console.log('📚 加载向量化模型...');
    const model = await use.load();
    console.log('✅ 模型加载成功\n');

    // 2. 测试查询
    const queries = [
      "记一下明天要做的事",
      "最近总是忘记事儿，帮我安排下日常吧", 
      "心情不好该做什么",
      "帮我mark一下：买菜、做饭、洗衣服"
    ];

    for (const query of queries) {
      console.log(`🔍 测试查询: "${query}"`);
      
      // 方式1: 直接查询
      console.log('  📝 方式1: 直接查询');
      let queryTensor = await model.embed([query]);
      let fullEmbedding = Array.from(await queryTensor.data());
      let queryEmbedding = fullEmbedding.slice(0, 384);
      
      await testSingleQuery(query, queryEmbedding, '直接查询');
      
      // 方式2: 增强查询（模拟知识库的格式）
      console.log('  📝 方式2: 增强查询');
      const enhancedQuery = `用户使用"${query}"这类表达，通常意图是添加待办任务或寻求帮助。需要理解用户意图并提供相关的任务建议和情绪支持。`;
      queryTensor = await model.embed([enhancedQuery]);
      fullEmbedding = Array.from(await queryTensor.data());
      queryEmbedding = fullEmbedding.slice(0, 384);
      
      await testSingleQuery(enhancedQuery, queryEmbedding, '增强查询');

      // 方式3: 关键词查询
      console.log('  📝 方式3: 关键词查询');
      const keywords = extractKeywords(query);
      const keywordQuery = `关键词：${keywords.join('、')}。表达方式涉及任务管理、提醒、情绪处理等场景。`;
      queryTensor = await model.embed([keywordQuery]);
      fullEmbedding = Array.from(await queryTensor.data());
      queryEmbedding = fullEmbedding.slice(0, 384);
      
      await testSingleQuery(keywordQuery, queryEmbedding, '关键词查询');
      
      console.log('\n' + '='.repeat(60) + '\n');
    }

    console.log('🎉 搜索测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testSearch(); 