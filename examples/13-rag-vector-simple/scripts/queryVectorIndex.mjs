import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 开始RAG向量检索测试...');

const embeddings = new HuggingFaceTransformersEmbeddings({
  model: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
});

// 测试查询列表
const testQueries = [
  '本周任务',
];

const run = async () => {
  try {
    const storePath = path.resolve(__dirname, '../vector_store');
    console.log(`📂 正在加载向量索引: ${storePath}`);
    
    const store = await FaissStore.load(storePath, embeddings);
    console.log('✅ 向量索引加载成功');

    // 测试多个查询
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n🔍 查询 ${i + 1}: ${query}`);
      console.log('━'.repeat(50));
      
      const results = await store.similaritySearch(query, 2);
      
      if (results.length === 0) {
        console.log('⚠️  没有找到相关结果');
        continue;
      }

      results.forEach((doc, idx) => {
        console.log(`📋 匹配结果 ${idx + 1}:`);
        console.log(`   任务: ${doc.metadata.name}`);
        console.log(`   优先级: ${doc.metadata.priority}`);
        console.log(`   截止日期: ${doc.metadata.due}`);
        console.log(`   详细内容:`);
        console.log(`   ${doc.pageContent.replace(/\n/g, '\n   ')}`);
        console.log('');
      });
    }
    
    console.log('🎉 RAG检索测试完成！');
    
  } catch (error) {
    console.error('❌ 向量检索失败:', error);
    console.error('💡 请确保先运行 npm run build 构建向量索引');
    process.exit(1);
  }
};

run().catch(console.error); 