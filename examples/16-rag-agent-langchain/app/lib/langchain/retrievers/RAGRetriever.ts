import { BaseRetriever } from '@langchain/core/retrievers';
import { Document } from '@langchain/core/documents';
import { getVectorService } from '../../../utils/vectorService';
import { getRagService } from '../../../utils/ragService';

/**
 * LangChain RAG检索器
 * 整合现有的向量服务和RAG服务
 */
export class RAGRetriever extends BaseRetriever {
  lc_namespace = ['rag_retriever'];
  
  private vectorService = getVectorService();
  private ragService = getRagService();

  constructor(private options: {
    topK?: number;
    threshold?: number;
  } = {}) {
    super();
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    if (!await this.vectorService.isAvailable() || !this.ragService.isAvailable()) {
      return [];
    }

    try {
      const queryEmbedding = await this.vectorService.embedText(query);
      const results = await this.ragService.searchKnowledge(
        queryEmbedding, 
        this.options.topK || 3, 
        this.options.threshold || 0.3
      );

      return results.map(result => new Document({
        pageContent: result.content,
        metadata: {
          score: result.score,
          source: result.source || 'knowledge_base',
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.warn('RAG检索失败:', error);
      return [];
    }
  }
}

export function createRAGRetriever(options?: { topK?: number; threshold?: number }): RAGRetriever {
  return new RAGRetriever(options);
} 