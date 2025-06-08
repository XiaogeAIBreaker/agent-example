/**
 * RAG搜索测试脚本 - 适配LangChain架构
 * 
 * 这个脚本用于测试RAG检索功能的准确性和性能：
 * - 测试不同查询策略的效果
 * - 验证向量搜索的相关度
 * - 分析RAGRetriever的工作效果
 * - 提供性能基准测试
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES模块路径处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.local') });

// Supabase客户端初始化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * 简化的向量化服务 - 用于测试环境
 */
class TestVectorService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
  }

  async initModel() {
    if (this.isLoaded) return;
    
    console.log('📚 加载TensorFlow向量化模型...');
    
    try {
      const tf = await import('@tensorflow/tfjs-node');
      const use = await import('@tensorflow-models/universal-sentence-encoder');
      
      this.model = await use.load();
      this.isLoaded = true;
      
      console.log('✅ 模型加载完成\n');
    } catch (error) {
      console.error('❌ 模型加载失败:', error.message);
      throw error;
    }
  }

  async embedText(text) {
    if (!this.isLoaded) {
      await this.initModel();
    }

    if (!this.model) {
      throw new Error('向量化模型未加载');
    }

    try {
      const embeddings = await this.model.embed([text]);
      const fullEmbedding = Array.from(await embeddings.data());
      
      // 截取前384维以匹配Supabase配置
      return fullEmbedding.slice(0, 384);
      
    } catch (error) {
      console.error('❌ 向量化失败:', error.message);
      throw error;
    }
  }
}

/**
 * 关键词提取函数 - 用于分析查询意图
 */
function extractQueryKeywords(text) {
  const keywordMap = {
    'task_add': ['记一下', 'mark', '标记', '提醒', '安排'],
    'mood_support': ['心情', '不好', '难受', '低落', '郁闷'],
    'memory_help': ['忘记', '遗忘', '记不住', '想不起'],
    'todo_manage': ['做', '任务', '事情', '待办', '清单'],
    'planning': ['计划', '规划', '时间', '管理', '组织']
  };
  
  const detectedKeywords = {};
  for (const [category, keywords] of Object.entries(keywordMap)) {
    detectedKeywords[category] = keywords.some(keyword => text.includes(keyword));
  }
  
  return detectedKeywords;
}

/**
 * 单个查询测试函数
 */
async function testSingleQuery(vectorService, queryText, method, enhancedQuery = null) {
  const query = enhancedQuery || queryText;
  
  try {
    console.log(`  📝 ${method}方式: "${query.substring(0, 80)}${query.length > 80 ? '...' : ''}"`);
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 向量化查询
    const queryEmbedding = await vectorService.embedText(query);
    const vectorizeTime = Date.now() - startTime;
    
    // 搜索相关知识
    const searchStart = Date.now();
    const { data: results, error } = await supabase.rpc('match_knowledge_vector', {
      query_embedding: queryEmbedding,
      match_count: 5,
      similarity_threshold: 0.1
    });
    const searchTime = Date.now() - searchStart;

    if (error) {
      console.error(`    ❌ ${method}搜索失败:`, error.message);
      return null;
    }

    // 如果没有结果，尝试降低阈值
    if (!results || results.length === 0) {
      console.log(`    ⚠️ ${method}未找到结果，尝试降低阈值...`);
      
      const { data: lowResults, error: lowError } = await supabase.rpc('match_knowledge_vector', {
        query_embedding: queryEmbedding,
        match_count: 5,
        similarity_threshold: 0.0
      });
      
      if (lowError) {
        console.error(`    ❌ 低阈值搜索失败:`, lowError.message);
        return null;
      }
      
      if (lowResults && lowResults.length > 0) {
        console.log(`    📊 低阈值找到 ${lowResults.length} 条结果 (向量化: ${vectorizeTime}ms, 搜索: ${searchTime}ms):`);
        lowResults.slice(0, 3).forEach((result, i) => {
          console.log(`      ${i+1}. ${result.title} (${(result.similarity * 100).toFixed(1)}%)`);
        });
      } else {
        console.log(`    ❌ ${method}完全无结果`);
      }
      return lowResults;
    }

    // 显示结果
    console.log(`    ✅ ${method}找到 ${results.length} 条结果 (向量化: ${vectorizeTime}ms, 搜索: ${searchTime}ms):`);
    results.forEach((result, i) => {
      console.log(`      ${i+1}. ${result.title} (${(result.similarity * 100).toFixed(1)}%)`);
      console.log(`         类别: ${result.category} | 建议: ${result.action}`);
      if (i === 0) {
        console.log(`         内容: ${result.content.substring(0, 60)}...`);
      }
    });
    
    return results;

  } catch (error) {
    console.error(`    ❌ ${method}测试异常:`, error.message);
    return null;
  }
}

/**
 * 性能基准测试
 */
async function runPerformanceBenchmark(vectorService) {
  console.log('\n🚀 性能基准测试\n');
  
  const testQueries = [
    'mark一下明天的会议',
    '心情低落怎么办',
    '经常忘记重要事情',
    '需要安排工作计划'
  ];
  
  const results = [];
  
  for (const query of testQueries) {
    console.log(`⏱️ 测试查询: "${query}"`);
    
    const iterations = 3;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      const queryEmbedding = await vectorService.embedText(query);
      const { data, error } = await supabase.rpc('match_knowledge_vector', {
        query_embedding: queryEmbedding,
        match_count: 3,
        similarity_threshold: 0.1
      });
      
      const totalTime = Date.now() - startTime;
      times.push(totalTime);
      
      if (error) {
        console.error(`  迭代 ${i+1} 失败:`, error.message);
      }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`  平均耗时: ${avgTime.toFixed(1)}ms | 最快: ${minTime}ms | 最慢: ${maxTime}ms\n`);
    
    results.push({
      query,
      avgTime,
      minTime,
      maxTime
    });
  }
  
  // 性能总结
  const overallAvg = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
  console.log(`📊 性能总结: 平均响应时间 ${overallAvg.toFixed(1)}ms`);
  
  return results;
}

/**
 * 查询策略对比测试
 */
async function testQueryStrategies(vectorService) {
  console.log('\n🔍 查询策略对比测试\n');
  
  const testCases = [
    {
      original: "记一下明天要做的事",
      description: "简单任务添加请求"
    },
    {
      original: "最近总是忘记事儿，帮我安排下日常吧",
      description: "复杂情感+请求表达"
    },
    {
      original: "心情不好该做什么",
      description: "情绪支持查询"
    },
    {
      original: "帮我mark一下：买菜、做饭、洗衣服",
      description: "具体任务列表"
    }
  ];

  for (const testCase of testCases) {
    console.log(`🎯 测试用例: ${testCase.description}`);
    console.log(`原始查询: "${testCase.original}"\n`);
    
    // 提取查询意图
    const keywords = extractQueryKeywords(testCase.original);
    const detectedIntents = Object.entries(keywords)
      .filter(([_, detected]) => detected)
      .map(([intent, _]) => intent);
    
    console.log(`🧠 检测到的意图: ${detectedIntents.length > 0 ? detectedIntents.join(', ') : '无特定意图'}`);
    
    // 策略1: 直接查询
    await testSingleQuery(vectorService, testCase.original, '直接查询');
    
    // 策略2: 增强查询（模拟RAGRetriever的处理）
    const enhancedQuery = `用户表达："${testCase.original}"。意图分析：这类表达通常涉及${detectedIntents.join('、')}等场景，需要提供相关的任务管理建议和支持。`;
    await testSingleQuery(vectorService, testCase.original, '增强查询', enhancedQuery);
    
    // 策略3: 关键词查询
    const extractedKeywords = testCase.original.match(/[\u4e00-\u9fa5]+/g) || [];
    const keywordQuery = `关键词：${extractedKeywords.slice(0, 5).join('、')}。场景：任务管理、情绪支持、提醒服务。`;
    await testSingleQuery(vectorService, testCase.original, '关键词查询', keywordQuery);
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

/**
 * 知识库覆盖度测试
 */
async function testKnowledgeCoverage() {
  console.log('📚 知识库覆盖度分析\n');
  
  try {
    // 获取知识库统计
    const { data: totalCount, error: countError } = await supabase
      .from('knowledge_vectors')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 获取知识库统计失败:', countError.message);
      return;
    }
    
    // 按类别统计
    const { data: categories, error: catError } = await supabase
      .from('knowledge_vectors')
      .select('category');
    
    if (catError) {
      console.error('❌ 获取类别统计失败:', catError.message);
      return;
    }
    
    const categoryStats = categories.reduce((stats, item) => {
      stats[item.category] = (stats[item.category] || 0) + 1;
      return stats;
    }, {});
    
    console.log(`📊 知识库总数: ${totalCount.length || 0} 条`);
    console.log('📋 类别分布:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} 条`);
    });
    
  } catch (error) {
    console.error('❌ 知识库分析失败:', error.message);
  }
}

/**
 * 主测试流程
 */
async function runSearchTests() {
  console.log('🔍 RAG+LangChain 搜索功能测试\n');
  
  // 环境检查
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ 请检查 .env.local 文件中的 SUPABASE_URL 和 SUPABASE_KEY 配置');
    process.exit(1);
  }

  try {
    // 初始化向量化服务
    const vectorService = new TestVectorService();
    await vectorService.initModel();

    // 1. 知识库覆盖度测试
    await testKnowledgeCoverage();

    // 2. 查询策略对比测试
    await testQueryStrategies(vectorService);

    // 3. 性能基准测试
    await runPerformanceBenchmark(vectorService);

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试过程失败:', error);
    process.exit(1);
  }
}

/**
 * 错误处理
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的Promise拒绝:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ 用户中断测试');
  process.exit(0);
});

// 执行测试
runSearchTests(); 