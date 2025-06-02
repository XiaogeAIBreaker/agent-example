# 07 - 增强提示 + Token控制待办事项应用

## 项目简介

这是基于案例06的迭代版本，在 **上下文记忆** 的基础上新增了 **Token长度控制** 功能。应用现在集成了 tiktoken 库，实现智能的 Token 计算和自动裁剪功能，确保在长对话中不会超出模型的 Token 限制，同时保持最佳的对话体验。

## 🆕 新增功能

### 🔧 Token长度控制系统
- **精确Token计算**: 使用 tiktoken 库精确计算消息Token数量
- **智能消息裁剪**: 当对话超出限制时，自动保留最近的重要对话
- **实时Token监控**: 界面显示当前Token使用情况和剩余额度
- **分级警告系统**: 根据使用量提供不同级别的视觉提醒

### 📊 Token使用统计
- **总Token数**: 当前对话的总Token数量
- **用户消息Token**: 用户发送消息的Token数量
- **AI回复Token**: AI回复消息的Token数量
- **平均Token/消息**: 每条消息的平均Token数量
- **使用进度条**: 可视化显示Token使用百分比

### ⚠️ 智能警告系统
- **🟢 安全 (< 75%)**: 绿色指示器，Token使用量正常
- **🟡 警告 (75-90%)**: 橙色指示器，提醒注意Token使用量
- **🔴 危险 (> 90%)**: 红色指示器，即将达到限制

### 💡 核心优势
- **自动化管理**: Token控制完全自动化，无需手动干预
- **系统消息保护**: 确保系统提示词始终保留
- **智能保留策略**: 优先保留最近的对话，保持上下文连贯性
- **性能优化**: 及时释放编码器资源，避免内存泄漏

## 继承功能

### 🧠 上下文记忆系统（来自案例06）
- **对话历史**: 自动记录用户消息和AI回复
- **操作记录**: 追踪所有执行的任务操作
- **上下文关联**: 维护最近的任务和操作状态

### 🔗 智能上下文引用
- **"刚才那个"**: 自动引用最近添加的任务
- **"再加一个"**: 基于上次添加的任务类型智能推荐
- **"最后添加的"**: 精确定位最近的操作目标
- **"完成刚才的"**: 智能关联到对应的任务

### 💭 记忆可视化
- **记忆视图**: 可切换查看完整的对话记忆
- **Token统计**: 新增详细的Token使用统计信息
- **时间戳**: 精确的操作时间记录
- **记忆管理**: 支持清除历史记录

## 核心功能

### 🎯 指令映射系统（继承）
- 智能指令解析和函数映射
- 结构化指令执行
- 实时操作反馈

### 📝 待办事项操作（增强版）
- **智能添加**: "帮我添加学习任务" → "再加一个类似的"
- **上下文完成**: "完成刚才添加的任务"
- **关联删除**: "删除最后那个任务"
- **批量操作**: 支持基于上下文的批量处理

### 🤖 增强AI对话（集成Token控制）
- Token限制下的上下文感知理解
- 智能的指令生成和执行
- 基于记忆的个性化回复
- 自动Token管理和对话优化

## 技术架构

### Token控制流程

```
用户输入 → Token计算 → 消息裁剪 → 上下文解析 → 记忆记录 → AI理解 → 指令映射 → 函数执行 → 结果记录
```

### 核心组件

1. **Token管理工具** (`utils/tokenTrimmer.ts`):
   - 精确Token计算
   - 智能消息裁剪
   - 多模型支持

2. **Token统计Hook** (`hooks/useTokenStats.ts`):
   - 实时Token统计
   - 分级警告系统
   - 使用情况分析

3. **增强API路由** (`api/chat/route.ts`):
   - 自动Token控制
   - 智能消息管理
   - 系统消息保护

4. **Enhanced ChatSidebar**: 升级对话组件
   - Token使用显示
   - 详细统计视图
   - 智能警告提示

### Token管理数据结构

```typescript
interface TokenStats {
  totalTokens: number;
  userTokens: number;
  assistantTokens: number;
  averageTokensPerMessage: number;
  isNearLimit: boolean;
  warningLevel: 'safe' | 'warning' | 'danger';
}
```

## 项目结构

```
07-enhanced-prompt/
├── app/
│   ├── components/
│   │   └── ChatSidebar.tsx          # Token感知对话组件
│   ├── hooks/
│   │   ├── useTokenStats.ts         # 🆕 Token统计Hook
│   │   ├── useInstructionMapping.ts # 指令映射Hook
│   │   └── useInstructionExecutor.ts# 指令执行器
│   ├── utils/
│   │   ├── tokenTrimmer.ts          # 🆕 Token控制工具
│   │   ├── instructionMapper.ts     # 核心映射器
│   │   └── jsonParser.ts           # JSON解析工具
│   ├── api/
│   │   └── chat/route.ts           # Token感知API
│   └── page.tsx                    # 主页面
├── package.json
├── TOKEN_CONTROL.md                # 🆕 Token控制详细文档
└── README.md
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env.local` 文件：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 启动应用
```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

## 🆕 Token控制使用

### Token监控
- 在聊天界面右上角查看实时Token使用情况
- Token数量根据使用程度变色提示
- 接近限制时自动显示警告

### 详细统计
1. 点击聊天界面的"📋 上下文"按钮
2. 查看详细的Token使用统计
3. 包含用户消息、AI回复、平均值等信息
4. 可视化进度条显示使用百分比

### 自动管理
- 当对话超出3000 token限制时
- 系统自动保留最近的重要对话
- 确保系统提示词不被删除
- 为AI回复预留足够空间

## 与案例06的区别

| 功能 | 案例06 | 案例07 |
|------|--------|--------|
| 上下文记忆 | ✅ | ✅ |
| 对话历史 | ✅ | ✅ |
| Token计算 | ❌ | 🆕 ✅ |
| Token监控 | ❌ | 🆕 ✅ |
| 智能裁剪 | ❌ | 🆕 ✅ |
| Token统计 | ❌ | 🆕 ✅ |
| 分级警告 | ❌ | 🆕 ✅ |

## 技术亮点

1. **精确Token计算**: 使用官方tiktoken库，与OpenAI计算一致
2. **智能裁剪算法**: 优先保留最近对话，保持上下文连贯
3. **实时监控系统**: 直观的Token使用情况显示
4. **性能优化**: 自动释放编码器资源，防止内存泄漏
5. **用户友好**: 分级警告和可视化进度条

## 📚 更多信息

详细的Token控制功能说明请参考：[TOKEN_CONTROL.md](./TOKEN_CONTROL.md)
