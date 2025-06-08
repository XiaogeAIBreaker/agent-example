# 增强提示词与Token控制系统架构文档

## 系统概览

增强提示词与Token控制系统在上下文记忆的基础上，集成了智能Token管理功能。该系统通过tiktoken库实现精确的Token计算和自动裁剪，确保在长对话中不超出模型限制，同时保持最佳的对话体验和上下文连贯性。

## 核心架构

### 1. 整体架构设计

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         用户界面层 (UI Layer)                               │
│  ┌─────────────────────────┬─────────────────────────────────────────────┐  │
│  │    智能监控面板          │           增强对话区域                        │  │
│  │  • Token使用统计        │  • 上下文感知对话                           │  │
│  │  • 分级警告系统          │  • 智能提示词展示                           │  │
│  │  • 性能状态监控          │  • Token感知输入                            │  │
│  └─────────────────────────┴─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API网关层 (API Gateway)                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    /api/chat (POST)                                     │ │
│  │  • Token预算管理     • 智能消息裁剪     • 上下文优化                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Token管理层 (Token Management Layer)                    │
│  ┌─────────────────────┬─────────────────────┬─────────────────────────┐    │
│  │   Token计算器        │    消息裁剪器        │      预算控制器          │    │
│  │                    │                    │                        │    │
│  │• 精确Token计算      │• 智能消息优选       │• 使用量监控             │    │
│  │• 多模型支持         │• 上下文保护         │• 警告分级               │    │
│  │• 性能优化           │• 系统消息保留       │• 自动裁剪触发           │    │
│  └─────────────────────┴─────────────────────┴─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      增强提示词层 (Enhanced Prompt Layer)                     │
│  ┌─────────────────────┬─────────────────────┬─────────────────────────┐    │
│  │   提示词构建器       │    上下文增强器      │      动态优化器          │    │
│  │                    │                    │                        │    │
│  │• 动态提示词生成     │• 记忆信息融合       │• Token预算优化          │    │
│  │• 模板化管理         │• 引用关系分析       │• 内容智能压缩           │    │
│  │• 多层次组合         │• 历史重要性评估     │• 效果监控评估           │    │
│  └─────────────────────┴─────────────────────┴─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                       指令执行层 (Instruction Layer)                         │
│  ┌─────────────────────┬─────────────────────┬─────────────────────────┐    │
│  │   指令解析器         │      执行引擎        │      结果处理器          │    │
│  │                    │                    │                        │    │
│  │• Token感知解析      │• 上下文任务执行     │• 智能结果反馈           │    │
│  │• 增强指令识别       │• 记忆状态更新       │• Token使用更新          │    │
│  │• 优化指令生成       │• 错误恢复处理       │• 性能指标收集           │    │
│  └─────────────────────┴─────────────────────┴─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI服务层 (AI Service Layer)                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      DeepSeek API                                       │ │
│  │  • Token预算内推理   • 增强上下文理解   • 优化响应生成                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Token管理数据流架构

```
用户输入 → Token计算 → 预算检查 → 消息裁剪 → 提示词构建 → AI推理
    ↓                                                         ↓
界面更新 ← 统计更新 ← 结果处理 ← 执行反馈 ← 指令解析 ← 响应生成
    ↓            ↓
性能监控    警告系统
```

### 3. 智能提示词增强流程

```
基础上下文 → 记忆融合 → Token预算评估 → 内容优化 → 提示词组装 → 效果验证
      ↑                                                      ↓
      ←─────── 动态调整 ←──── 性能反馈 ←──────────────────────┘
```

## 核心组件详解

### 1. TokenTrimmer (Token裁剪器)

**核心职责**:
- 精确计算消息Token数量
- 智能裁剪超出预算的消息
- 保护系统提示词不被删除
- 优化Token使用效率

**智能裁剪算法**:
```typescript
export function trimMessages(messages: Message[], maxTokens: number): Message[] {
  // 1. 保护系统消息
  const systemMessages = messages.filter(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // 2. 计算可用Token预算
  const systemTokens = calculateMessagesTokens(systemMessages);
  const availableTokens = maxTokens - systemTokens - REPLY_TOKEN_BUFFER;
  
  // 3. 从最新消息开始保留
  const trimmedConversation = [];
  let currentTokens = 0;
  
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i];
    const msgTokens = calculateTokens(msg.content);
    
    if (currentTokens + msgTokens <= availableTokens) {
      trimmedConversation.unshift(msg);
      currentTokens += msgTokens;
    } else {
      break; // 超出预算，停止添加
    }
  }
  
  return [...systemMessages, ...trimmedConversation];
}
```

### 2. useTokenStats (Token统计Hook)

**核心功能**:
- 实时计算Token使用统计
- 生成警告级别和用户提示
- 优化性能，避免重复计算
- 提供可视化数据支持

**统计数据结构**:
```typescript
interface TokenStats {
  totalTokens: number;              // 总Token数
  userTokens: number;               // 用户消息Token数
  assistantTokens: number;          // AI回复Token数
  averageTokensPerMessage: number;  // 平均每消息Token数
  isNearLimit: boolean;             // 是否接近限制
  warningLevel: 'safe' | 'warning' | 'danger'; // 警告级别
  utilizationPercentage: number;    // 使用率百分比
}
```

**智能警告系统**:
```typescript
const calculateWarningLevel = (tokens: number, maxTokens: number): WarningLevel => {
  const percentage = (tokens / maxTokens) * 100;
  
  if (percentage >= 90) return 'danger';   // 红色警告
  if (percentage >= 75) return 'warning';  // 橙色警告
  return 'safe';                           // 绿色安全
};

const generateWarningMessage = (stats: TokenStats): string => {
  switch (stats.warningLevel) {
    case 'danger':
      return `⚠️ Token使用率${stats.utilizationPercentage.toFixed(1)}%，即将自动裁剪`;
    case 'warning':
      return `⚡ Token使用率${stats.utilizationPercentage.toFixed(1)}%，建议注意`;
    case 'safe':
    default:
      return `✅ Token使用正常 (${stats.utilizationPercentage.toFixed(1)}%)`;
  }
};
```

### 3. EnhancedPromptBuilder (增强提示词构建器)

**核心能力**:
- **动态构建**: 基于Token预算动态调整提示词内容
- **内容优化**: 智能压缩和精简提示词内容
- **模块化组合**: 支持可插拔的提示词模块
- **效果监控**: 跟踪提示词效果和Token使用

**提示词模块系统**:
```typescript
interface PromptModule {
  name: string;
  priority: number;
  estimatedTokens: number;
  generateContent(context: ContextInfo): string;
  canCompress(): boolean;
  compress(content: string): string;
}

class SystemInstructionModule implements PromptModule {
  name = 'system_instruction';
  priority = 10; // 最高优先级
  estimatedTokens = 150;
  
  generateContent(context: ContextInfo): string {
    return `你是一个智能待办事项助手，具有上下文记忆能力。`;
  }
  
  canCompress(): boolean {
    return false; // 系统指令不可压缩
  }
}

class ContextMemoryModule implements PromptModule {
  name = 'context_memory';
  priority = 8;
  estimatedTokens = 100;
  
  generateContent(context: ContextInfo): string {
    return `
## 当前上下文：
- 最后任务: ${context.lastTask || '无'}
- 对话轮数: ${context.messageCount}
- 最近操作: ${context.recentOperations.slice(0, 3).map(op => op.action).join(', ')}`;
  }
  
  canCompress(): boolean {
    return true;
  }
  
  compress(content: string): string {
    // 压缩上下文信息，保留关键数据
    return content.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  }
}
```

### 4. ChatSidebar (增强对话组件)

**新增功能**:
- **Token监控面板**: 实时显示Token使用情况
- **智能警告**: 分级警告和视觉提示
- **详细统计**: Token使用的详细分析
- **性能优化**: 防止不必要的重渲染

**Token监控界面**:
```typescript
const TokenMonitor = ({ stats }: { stats: TokenStats }) => {
  const getStatusColor = (level: WarningLevel): string => {
    switch (level) {
      case 'danger': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'safe': return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className={`p-3 rounded-lg ${getStatusColor(stats.warningLevel)}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Token使用: {stats.totalTokens}/{MAX_TOKENS}
        </span>
        <span className="text-xs">
          {stats.utilizationPercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            stats.warningLevel === 'danger' ? 'bg-red-600' :
            stats.warningLevel === 'warning' ? 'bg-orange-600' : 'bg-green-600'
          }`}
          style={{ width: `${Math.min(stats.utilizationPercentage, 100)}%` }}
        />
      </div>
      
      <div className="text-xs opacity-75">
        {generateWarningMessage(stats)}
      </div>
    </div>
  );
};
```

## 技术栈详解

### 1. 前端技术栈

```
Next.js 14 + React 18 + TypeScript
├── UI框架: Tailwind CSS + 响应式设计
├── 状态管理: React Hooks + 优化缓存
├── AI集成: Vercel AI SDK + Token控制
├── Token计算: tiktoken库 + 性能优化
└── 数据可视化: Chart.js + 实时更新
```

### 2. Token技术栈

```
tiktoken + 智能算法
├── Token计算: GPT-3.5-turbo编码器
├── 消息裁剪: 智能保留算法
├── 预算管理: 动态预算分配
├── 性能优化: 缓存 + 异步处理
└── 监控系统: 实时统计 + 警告分级
```

### 3. 提示词技术栈

```
模块化构建 + 动态优化
├── 模块系统: 可插拔提示词模块
├── 优先级管理: 智能内容选择
├── 压缩算法: 无损内容压缩
├── 效果监控: 提示词效果评估
└── 自适应调整: 基于反馈的优化
```

## 性能优化策略

### 1. Token计算优化

**编码器缓存**:
```typescript
class TokenizerCache {
  private static instance: TokenizerCache;
  private encoder: TiktokenEncoding | null = null;
  
  static getInstance(): TokenizerCache {
    if (!TokenizerCache.instance) {
      TokenizerCache.instance = new TokenizerCache();
    }
    return TokenizerCache.instance;
  }
  
  calculateTokens(text: string): number {
    if (!this.encoder) {
      throw new Error('Encoder not initialized');
    }
    return this.encoder.encode(text).length;
  }
  
  dispose(): void {
    if (this.encoder) {
      this.encoder.free();
      this.encoder = null;
    }
  }
}
```

### 2. 计算缓存优化

**结果缓存**:
```typescript
const tokenCache = new Map<string, number>();

export function calculateTokensCached(text: string): number {
  const cacheKey = `token_${text.length}_${text.slice(0, 50)}`;
  
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }
  
  const tokens = TokenizerCache.getInstance().calculateTokens(text);
  tokenCache.set(cacheKey, tokens);
  
  // 限制缓存大小
  if (tokenCache.size > 1000) {
    const firstKey = tokenCache.keys().next().value;
    tokenCache.delete(firstKey);
  }
  
  return tokens;
}
```

### 3. 组件渲染优化

**智能更新**:
```typescript
const TokenStatsDisplay = React.memo(({ messages }: { messages: Message[] }) => {
  const stats = useMemo(() => {
    return calculateTokenStats(messages);
  }, [messages.length]); // 只在消息数量变化时重计算
  
  return <TokenMonitor stats={stats} />;
});

const useTokenStats = (messages: Message[]): TokenStats => {
  return useMemo(() => {
    const totalTokens = calculateMessagesTokens(messages);
    const userTokens = messages
      .filter(m => m.role === 'user')
      .reduce((sum, m) => sum + calculateTokens(m.content), 0);
    const assistantTokens = totalTokens - userTokens;
    
    return {
      totalTokens,
      userTokens,
      assistantTokens,
      averageTokensPerMessage: messages.length > 0 ? totalTokens / messages.length : 0,
      isNearLimit: totalTokens > MAX_TOKENS * 0.75,
      warningLevel: calculateWarningLevel(totalTokens, MAX_TOKENS),
      utilizationPercentage: (totalTokens / MAX_TOKENS) * 100
    };
  }, [messages.length]);
};
```

## 安全性设计

### 1. Token预算保护

**防止超限**:
```typescript
const ensureTokenBudget = (messages: Message[]): Message[] => {
  const totalTokens = calculateMessagesTokens(messages);
  
  if (totalTokens <= MAX_TOKENS) {
    return messages;
  }
  
  // 强制裁剪，确保不超出限制
  return trimMessages(messages, MAX_TOKENS * 0.8); // 保留20%缓冲
};
```

### 2. 系统消息保护

**关键内容保护**:
```typescript
const protectSystemMessages = (messages: Message[]): Message[] => {
  const systemMessages = messages.filter(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');
  
  // 系统消息永远不会被裁剪
  const trimmedOthers = trimMessages(otherMessages, 
    MAX_TOKENS - calculateMessagesTokens(systemMessages));
  
  return [...systemMessages, ...trimmedOthers];
};
```

### 3. 内存泄漏防护

**资源清理**:
```typescript
export const cleanupTokenizer = (): void => {
  TokenizerCache.getInstance().dispose();
  tokenCache.clear();
};

// 组件卸载时清理
useEffect(() => {
  return () => {
    cleanupTokenizer();
  };
}, []);
```

## 扩展性设计

### 1. 多模型支持

**模型适配器**:
```typescript
interface ModelTokenizer {
  modelName: string;
  maxTokens: number;
  calculateTokens(text: string): number;
  getOptimalTrimSize(): number;
}

class GPT35Tokenizer implements ModelTokenizer {
  modelName = 'gpt-3.5-turbo';
  maxTokens = 4096;
  
  calculateTokens(text: string): number {
    return TokenizerCache.getInstance().calculateTokens(text);
  }
  
  getOptimalTrimSize(): number {
    return this.maxTokens * 0.75; // 保留25%缓冲
  }
}
```

### 2. 提示词模板扩展

**模板系统**:
```typescript
interface PromptTemplate {
  name: string;
  build(context: any): string;
  estimateTokens(context: any): number;
}

class TaskManagementTemplate implements PromptTemplate {
  name = 'task_management';
  
  build(context: TaskContext): string {
    return `你是任务管理助手...
当前状态: ${context.taskCount}个任务
最近操作: ${context.lastOperation}`;
  }
  
  estimateTokens(context: TaskContext): number {
    return 50 + context.taskCount * 5;
  }
}
```

## 学习价值总结

### 1. Token管理技术

**核心学习点**:
- Token计算的精确方法和性能优化
- 智能消息裁剪算法的设计思路
- 预算管理和资源控制的实现方式
- 实时监控和警告系统的构建

### 2. 增强提示词设计

**架构设计能力**:
- 模块化提示词系统的设计
- 动态内容生成和优化技术
- 基于Token预算的智能调整
- 多层次提示词组合策略

### 3. 性能优化实践

**工程实践价值**:
- 大规模文本处理的性能优化
- 内存管理和资源清理
- 智能缓存策略的应用
- 用户体验与性能的平衡

### 4. 系统设计思维

**企业级应用设计**:
- 可扩展的模块化架构
- 多模型适配的设计模式
- 监控和告警系统的构建
- 安全性和稳定性的保障

这个案例展示了如何在保持AI应用高可用性的同时，有效管理Token资源，为构建生产级AI应用提供了完整的Token管理解决方案。为后续的函数调用、复杂推理等高级功能提供了资源管理的基础保障。 