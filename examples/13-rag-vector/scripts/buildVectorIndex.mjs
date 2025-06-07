import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';
import { Document } from '@langchain/core/documents';

// 兼容 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始构建RAG向量索引...');

// Step 1: 加载任务数据
const rawPath = path.resolve(__dirname, '../data/tasks.json');
console.log(`📂 正在加载数据文件: ${rawPath}`);

const rawData = fs.readFileSync(rawPath, 'utf-8');
const tasks = JSON.parse(rawData);
console.log(`✅ 成功加载 ${tasks.length} 个任务`);

// Step 2: 构造文档数组
const documents = tasks.map((task) => {
  const content = `任务名称：${task.name}\n描述：${task.description}\n优先级：${task.priority}\n截止日期：${task.due}`;
  return new Document({
    pageContent: content,
    metadata: {
      name: task.name,
      due: task.due,
      priority: task.priority
    }
  });
});

console.log(`📋 已构造 ${documents.length} 个文档对象`);

// Step 3: 使用 HuggingFace 模型生成向量
console.log('🤖 正在初始化嵌入模型...');
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', // 中文兼容模型
  // 可选配置项可以省略，使用默认值
});

const run = async () => {
  try {
    console.log('⚡ 正在生成向量嵌入并构建FAISS索引...');
    const vectorStore = await FaissStore.fromDocuments(documents, embeddings);
    
    const savePath = path.resolve(__dirname, '../vector_store');
    
    // 确保目录存在
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }
    
    await vectorStore.save(savePath);
    console.log(`✅ 向量索引构建完成，已保存至 ${savePath}`);
    console.log('🎉 RAG向量数据库准备就绪，可以开始查询了！');
  } catch (error) {
    console.error('❌ 向量索引构建失败:', error);
    process.exit(1);
  }
};

run().catch(console.error); 