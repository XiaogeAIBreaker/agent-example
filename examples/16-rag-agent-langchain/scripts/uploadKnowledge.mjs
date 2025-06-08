/**
 * 知识库上传脚本 - 适配LangChain架构
 * 
 * 这个脚本用于将知识库数据向量化并上传到Supabase：
 * - 使用项目中的VectorService进行向量化
 * - 支持批量上传和错误重试
 * - 提供详细的进度反馈和错误日志
 * - 集成测试功能验证上传结果
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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
 * 简化的向量化服务 - 用于脚本环境
 * 复用项目中VectorService的逻辑
 */
class ScriptVectorService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
  }

  async initModel() {
    if (this.isLoaded) return;
    
    console.log('🔄 加载TensorFlow向量化模型...');
    
    try {
      // 动态导入TensorFlow模块
      const tf = await import('@tensorflow/tfjs-node');
      const use = await import('@tensorflow-models/universal-sentence-encoder');
      
      this.model = await use.load();
      this.isLoaded = true;
      
      console.log('✅ TensorFlow模型加载成功');
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
      console.log(`📝 向量化文本: ${text.substring(0, 50)}...`);
      
      const embeddings = await this.model.embed([text]);
      const fullEmbedding = Array.from(await embeddings.data());
      
      // 截取前384维以匹配Supabase配置
      const embedding = fullEmbedding.slice(0, 384);
      
      console.log(`📐 生成向量维度: ${embedding.length}`);
      return embedding;
      
    } catch (error) {
      console.error('❌ 文本向量化失败:', error.message);
      throw error;
    }
  }
}

/**
 * 主上传流程
 */
async function uploadKnowledgeBase() {
  console.log('🚀 开始RAG+LangChain知识库上传流程...\n');
  
  // 1. 环境检查
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ 请检查 .env.local 文件中的 SUPABASE_URL 和 SUPABASE_KEY 配置');
    process.exit(1);
  }

  // 2. 初始化向量化服务
  const vectorService = new ScriptVectorService();
  await vectorService.initModel();

  // 3. 读取知识库数据
  const knowledgeFile = join(__dirname, '../data/knowledge-base.json');
  
  if (!fs.existsSync(knowledgeFile)) {
    console.error(`❌ 知识库文件不存在: ${knowledgeFile}`);
    console.log('💡 请先创建知识库文件，可以参考 data/knowledge-base.example.json');
    process.exit(1);
  }

  const knowledgeData = JSON.parse(fs.readFileSync(knowledgeFile, 'utf-8'));
  console.log(`📚 读取到 ${knowledgeData.length} 条知识条目\n`);

  // 4. 批量处理和上传
  let successCount = 0;
  let failCount = 0;
  const failedItems = [];

  for (const [index, item] of knowledgeData.entries()) {
    try {
      console.log(`🔄 处理第 ${index + 1}/${knowledgeData.length} 条: ${item.title}`);
      
      // 构造向量化文本（与RAGRetriever的格式保持一致）
      const vectorText = `类别：${item.category}。标题：${item.title}。内容：${item.content}。关键词：${item.keywords?.join('、') || ''}。建议行动：${item.action || ''}`;
      
      // 向量化处理
      const embedding = await vectorService.embedText(vectorText);

      // 插入数据库
      const { error } = await supabase.from('knowledge_vectors').insert({
        category: item.category,
        title: item.title,
        content: item.content,
        keywords: item.keywords || [],
        action: item.action || '',
        embedding
      });

      if (error) {
        console.error(`❌ 数据库插入失败: ${item.title}`, error.message);
        failCount++;
        failedItems.push({ item, error: error.message });
      } else {
        console.log(`✅ 成功插入: ${item.title}`);
        successCount++;
      }

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ 处理失败: ${item.title}`, error.message);
      failCount++;
      failedItems.push({ item, error: error.message });
    }
  }
  
  // 5. 输出结果统计
  console.log('\n' + '='.repeat(50));
  console.log('🎉 知识库上传完成!');
  console.log(`✅ 成功: ${successCount} 条`);
  console.log(`❌ 失败: ${failCount} 条`);
  
  if (failedItems.length > 0) {
    console.log('\n❌ 失败的条目:');
    failedItems.forEach(({ item, error }, i) => {
      console.log(`  ${i + 1}. ${item.title}: ${error}`);
    });
  }
  
  // 6. 测试向量搜索功能
  if (successCount > 0) {
    console.log('\n🔍 测试向量搜索功能...');
    await testVectorSearch(vectorService);
  }
}

/**
 * 测试向量搜索功能
 */
async function testVectorSearch(vectorService) {
  const testQueries = [
    'mark一下任务',
    '心情不好怎么办',
    '忘记事情了',
    '帮我安排一下'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      // 向量化查询
      const queryEmbedding = await vectorService.embedText(query);
      
      // 搜索相关知识
      const { data, error } = await supabase.rpc('match_knowledge_vector', {
        query_embedding: queryEmbedding,
        match_count: 3,
        similarity_threshold: 0.1
      });

      if (error) {
        console.error('❌ 搜索失败:', error.message);
      } else if (!data || data.length === 0) {
        console.log('⚠️ 未找到相关知识');
      } else {
        console.log(`📋 找到 ${data.length} 条相关知识:`);
        data.forEach((item, i) => {
          console.log(`  ${i + 1}. 标题: ${item.title}`);
          console.log(`     类别: ${item.category}`);
          console.log(`     相似度: ${(item.similarity * 100).toFixed(1)}%`);
          console.log(`     建议: ${item.action}`);
        });
      }
    } catch (error) {
      console.error(`❌ 查询测试失败: ${query}`, error.message);
    }
  }
}

/**
 * 错误处理和清理
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的Promise拒绝:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ 用户中断操作');
  process.exit(0);
});

// 执行主流程
uploadKnowledgeBase().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
}); 