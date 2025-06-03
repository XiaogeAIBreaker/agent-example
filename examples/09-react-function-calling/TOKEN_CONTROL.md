# Token 长度控制功能

本项目已集成 tiktoken 库，实现智能的 Token 长度控制功能，确保在长对话中不会超出模型的 Token 限制。

## 功能特性

### 🎯 核心功能
- **自动Token计算**: 使用 tiktoken 精确计算消息的 Token 数量
- **智能消息裁剪**: 当对话超出限制时，自动保留最近的对话内容
- **实时Token监控**: 界面显示当前 Token 使用情况和剩余额度
- **分级警告系统**: 根据使用量提供不同级别的视觉提醒

### 📊 Token 统计
- **总Token数**: 当前对话的总 Token 数量
- **用户消息Token**: 用户发送消息的 Token 数量
- **AI回复Token**: AI 回复消息的 Token 数量  
- **平均Token/消息**: 每条消息的平均 Token 数量
- **使用进度条**: 可视化显示 Token 使用百分比

### ⚠️ 智能警告系统
- **🟢 安全 (< 75%)**: 绿色指示器，Token 使用量正常
- **🟡 警告 (75-90%)**: 橙色指示器，提醒注意 Token 使用量
- **🔴 危险 (> 90%)**: 红色指示器，即将达到限制

## 技术实现

### 1. Token 计算工具 (`utils/tokenTrimmer.ts`)

```typescript
// 计算消息数组的总Token数量
getTotalTokenCount(messages, 'deepseek-chat'): number

// 计算单条消息的Token数量  
getMessageTokenCount(message, 'deepseek-chat'): number

// 智能裁剪消息以适应Token限制
trimMessagesToTokenLimit(messages, 'deepseek-chat', 3000): Message[]
```

### 2. Token 统计 Hook (`hooks/useTokenStats.ts`)

提供详细的 Token 使用统计信息：

```typescript
const tokenStats = useTokenStats(messages, 3000, 'deepseek-chat');
// 返回: { totalTokens, userTokens, assistantTokens, averageTokensPerMessage, isNearLimit, warningLevel }
```

### 3. API 集成 (`api/chat/route.ts`)

在发送请求前自动进行 Token 长度控制：

```typescript
// 计算原始Token数量
const originalTokenCount = getTotalTokenCount(allMessages, 'deepseek-chat');

// 如果超出限制，进行智能裁剪
if (originalTokenCount > maxTokens) {
  const trimmedConversation = trimMessagesToTokenLimit(
    conversationMessages, 
    'deepseek-chat', 
    maxTokens - systemTokens - 200 // 预留响应空间
  );
}
```

## 界面功能

### 头部显示
- 实时显示当前消息数量和 Token 使用情况
- 根据使用量变色的 Token 计数器 
- 接近限制时显示警告提示

### 上下文视图
- 详细的 Token 使用统计表
- 用户消息与 AI 回复的 Token 分布
- 可视化的使用进度条
- 分类统计信息

## 配置参数

### Token 限制设置
- **默认限制**: 3000 tokens (适合 DeepSeek-chat)
- **警告阈值**: 75% (2250 tokens)  
- **危险阈值**: 90% (2700 tokens)
- **自动裁剪**: > 3000 tokens

### 模型支持
- `deepseek-chat` (默认，使用 gpt-3.5-turbo 编码器)
- `gpt-3.5-turbo`
- `gpt-4`

## 使用方式

1. **自动运行**: Token 控制完全自动化，无需手动干预
2. **实时监控**: 在聊天界面查看 Token 使用情况
3. **上下文管理**: 点击"📋 上下文"按钮查看详细统计
4. **智能裁剪**: 超出限制时自动保留最重要的对话内容

## 优势特点

✅ **精确计算**: 使用官方 tiktoken 库，计算结果与 OpenAI 一致  
✅ **智能保留**: 优先保留最近的对话，保持上下文连贯性  
✅ **系统消息保护**: 确保系统提示词始终保留  
✅ **预留空间**: 为 AI 回复预留足够的 Token 空间  
✅ **性能优化**: 及时释放编码器资源，避免内存泄漏  
✅ **用户友好**: 直观的界面提示和警告系统

这个功能确保了在长时间对话中，应用能够稳定运行而不会因为 Token 限制导致请求失败。 