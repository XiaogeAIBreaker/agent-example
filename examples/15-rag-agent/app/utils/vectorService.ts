// 向量化服务 - 用于文本嵌入
export class VectorService {
  private model: any = null;
  private isLoading = false;
  private isLoaded = false;

  constructor() {
    // 预加载模型（如果在服务器环境）
    if (typeof window === 'undefined') {
      this.preloadModel();
    }
  }

  // 预加载模型
  private async preloadModel() {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    try {
      console.log('🔄 开始加载TensorFlow向量化模型...');
      
      // 检查环境，避免在不支持的环境中加载
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        // 在开发环境中，先尝试设置TensorFlow后端
        try {
          const tf = await import('@tensorflow/tfjs-node');
          console.log('✅ TensorFlow后端加载成功');
        } catch (backendError) {
          console.warn('⚠️ TensorFlow后端加载失败，尝试使用CPU后端:', backendError instanceof Error ? backendError.message : String(backendError));
          // 如果node后端失败，尝试使用CPU后端
          await import('@tensorflow/tfjs');
        }
      }
      
      // 动态导入模型
      const use = await import('@tensorflow-models/universal-sentence-encoder');
      this.model = await use.load();
      this.isLoaded = true;
      
      console.log('✅ TensorFlow向量化模型加载完成');
    } catch (error) {
      console.error('❌ 向量化模型加载失败:', error);
      console.warn('⚠️ 向量服务将不可用，但不影响其他功能');
    } finally {
      this.isLoading = false;
    }
  }

  // 获取模型实例
  private async getModel() {
    if (!this.isLoaded && !this.isLoading) {
      await this.preloadModel();
    }
    
    // 等待模型加载完成
    while (this.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.model;
  }

  // 检查服务是否可用
  async isAvailable(): Promise<boolean> {
    try {
      const model = await this.getModel();
      return !!model;
    } catch {
      return false;
    }
  }

  // 将文本转换为向量
  async embedText(text: string): Promise<number[]> {
    try {
      const model = await this.getModel();
      if (!model) {
        throw new Error('向量化模型未加载');
      }

      console.log(`📝 向量化文本: ${text.substring(0, 50)}...`);
      
      const embeddings = await model.embed([text]);
      const fullEmbedding = Array.from(await embeddings.data()) as number[];
      
      // 截取前384维以匹配Supabase配置
      const embedding = fullEmbedding.slice(0, 384);
      
      console.log(`📐 生成向量维度: ${embedding.length}`);
      return embedding;
      
    } catch (error) {
      console.error('❌ 文本向量化失败:', error);
      throw error;
    }
  }


}

// 创建单例实例
let vectorServiceInstance: VectorService | null = null;

export function getVectorService(): VectorService {
  if (!vectorServiceInstance) {
    vectorServiceInstance = new VectorService();
  }
  return vectorServiceInstance;
} 