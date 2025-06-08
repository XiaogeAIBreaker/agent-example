

// RAG服务类
export class RAGService {
  private supabase: any;
  private isInitialized = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.warn('⚠️ RAG服务未初始化：缺少Supabase配置');
      return;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      this.isInitialized = true;
    } catch (error) {
      console.warn('⚠️ RAG服务初始化失败:', error);
    }
  }

  // 检查服务是否可用
  isAvailable(): boolean {
    return this.isInitialized;
  }

  // 执行向量搜索 - 使用数据库层面的向量搜索
  async searchKnowledge(
    queryEmbedding: number[], 
    matchCount: number = 3,
    similarityThreshold: number = 0.3
  ): Promise<any[]> {
    if (!this.isInitialized) {
      console.warn('⚠️ RAG服务不可用，跳过知识检索');
      return [];
    }

    try {
      console.log(`🔍 执行RAG知识检索，向量维度: ${queryEmbedding.length}`);
      
      // 使用RPC调用数据库向量搜索函数
      const vectorString = `[${queryEmbedding.join(',')}]`;
      const { data: results, error } = await this.supabase
        .rpc('match_knowledge_vector', {
          query_embedding: vectorString,
          match_count: matchCount,
          similarity_threshold: similarityThreshold
        });

      if (error) {
        console.error('❌ RAG检索失败:', error.message);
        return [];
      }

      if (!results || results.length === 0) {
        console.warn('⚠️ 没有找到相关知识');
        return [];
      }

      console.log(`📚 RAG检索到 ${results.length} 条相关知识`);
      return results;

    } catch (error) {
      console.error('❌ RAG检索异常:', error);
      return [];
    }
  }



  // 根据检索结果生成知识上下文
  formatKnowledgeContext(knowledgeResults: any[]): string {
    if (!knowledgeResults || knowledgeResults.length === 0) {
      return '';
    }

    const contextItems = knowledgeResults.map((item: any, index: number) => {
      const similarity = item.similarity || (1 - (item.distance || 0));
      return `【知识${index + 1}】${item.title}
类别：${item.category}
内容：${item.content}
建议行动：${item.action}
相似度：${(similarity * 100).toFixed(1)}%`;
    });

    return `

## 🧠 RAG检索知识：
${contextItems.join('\n\n')}

基于以上检索到的知识，请结合用户需求进行分析和回应。`;
  }


}

// 创建单例实例
let ragServiceInstance: RAGService | null = null;

export function getRagService(): RAGService {
  if (!ragServiceInstance) {
    ragServiceInstance = new RAGService();
  }
  return ragServiceInstance;
} 