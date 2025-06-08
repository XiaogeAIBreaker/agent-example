/**
 * 向量化服务
 * 
 * 这个服务负责将文本转换为数值向量，用于RAG系统的语义搜索：
 * - 使用TensorFlow的Universal Sentence Encoder模型
 * - 支持中英文文本的向量化
 * - 生成384维的向量表示
 * - 提供异步加载和缓存机制
 * - 包含完善的错误处理和降级策略
 * 
 * 技术栈：
 * - @tensorflow/tfjs-node: TensorFlow Node.js后端
 * - @tensorflow-models/universal-sentence-encoder: 预训练的句子编码器
 * 
 * 使用场景：
 * - RAG知识库的文档向量化
 * - 用户查询的实时向量化
 * - 语义相似度计算
 */
export class VectorService {
  // 模型实例和状态管理
  private model: any = null;          // TensorFlow模型实例
  private isLoading = false;          // 模型加载状态标志
  private isLoaded = false;           // 模型就绪状态标志

  /**
   * 构造函数 - 初始化向量化服务
   * 
   * 在服务器环境中自动预加载模型，以减少首次使用时的延迟
   * 客户端环境跳过预加载，避免不必要的资源消耗
   */
  constructor() {
    // 只在服务器环境中预加载模型
    if (typeof window === 'undefined') {
      this.preloadModel();
    }
  }

  /**
   * 预加载TensorFlow模型
   * 
   * 异步加载Universal Sentence Encoder模型：
   * 1. 检查加载状态，避免重复加载
   * 2. 尝试加载TensorFlow Node.js后端
   * 3. 加载预训练的句子编码器模型
   * 4. 设置加载完成标志
   * 5. 提供完善的错误处理和降级策略
   * 
   * 错误处理：
   * - 后端加载失败时尝试CPU后端
   * - 模型加载失败时记录警告但不中断系统
   * - 确保向量服务不可用时其他功能正常运行
   */
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

  /**
   * 获取模型实例
   * 
   * 确保模型已加载并返回可用的模型实例：
   * 1. 检查模型是否已加载，如未加载则触发预加载
   * 2. 等待模型加载完成（使用轮询机制）
   * 3. 返回可用的模型实例
   * 
   * @returns Promise<any> - TensorFlow模型实例或null
   */
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

  /**
   * 检查向量化服务是否可用
   * 
   * 验证模型是否成功加载并可以正常使用：
   * 1. 尝试获取模型实例
   * 2. 检查模型是否为有效对象
   * 3. 返回可用性状态
   * 
   * @returns Promise<boolean> - 服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      const model = await this.getModel();
      return !!model;
    } catch {
      return false;
    }
  }

  /**
   * 将文本转换为数值向量
   * 
   * 这是核心方法，将输入文本转换为384维的数值向量：
   * 1. 验证模型可用性
   * 2. 使用TensorFlow模型进行文本编码
   * 3. 提取向量数据并截取到指定维度
   * 4. 返回标准化的向量数组
   * 
   * 技术细节：
   * - 使用Universal Sentence Encoder进行编码
   * - 生成512维向量后截取前384维以匹配Supabase配置
   * - 支持中英文和多语言文本
   * 
   * @param text - 要向量化的文本内容
   * @returns Promise<number[]> - 384维的数值向量数组
   * @throws Error - 当模型未加载或向量化失败时抛出错误
   */
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