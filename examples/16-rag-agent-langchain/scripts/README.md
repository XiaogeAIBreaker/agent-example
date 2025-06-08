# Scripts 工具集

本目录包含了RAG+LangChain智能代理系统的管理和测试工具。这些脚本用于简化开发、维护和诊断工作。

## 🚀 快速开始

在项目根目录运行任何脚本前，请确保：

1. **安装依赖**：`npm install`
2. **配置环境**：创建 `.env.local` 文件并配置必要的环境变量
3. **数据库初始化**：确保Supabase数据库已正确设置

## 📋 脚本清单

### 🔧 系统诊断 - systemDiagnosis.mjs

**功能**：全面检查系统健康状况和配置正确性

```bash
npm run system-diagnosis
```

**检查内容**：
- ✅ Node.js版本和环境变量配置
- ✅ 关键依赖包安装和导入状态
- ✅ TensorFlow向量化服务可用性
- ✅ Supabase数据库连接状态
- ✅ DeepSeek API配置验证
- ✅ LangChain组件完整性
- ✅ 性能基准测试
- ✅ 系统文件检查

**适用场景**：
- 🔍 新环境部署后的验证
- 🐛 故障排查和问题定位
- 🏥 定期健康检查
- 📊 性能监控

**输出示例**：
```
🔍 系统诊断报告
============================================================
📊 总体状况: 18/20 通过
⚠️ 警告: 2

📋 ENVIRONMENT:
  ✅ nodejs_version: Node.js v20.11.0
  ✅ DEEPSEEK_API_KEY: 已配置
  ✅ SUPABASE_URL: 已配置
  
📋 SERVICES:
  ✅ tensorflow_backend: TensorFlow后端可用
  ✅ vectorization: 生成512维向量
  ✅ supabase_connection: 连接成功
  
📋 PERFORMANCE:
  ✅ vectorization_speed: 平均245.2ms
```

---

### 📚 知识库上传 - uploadKnowledge.mjs

**功能**：批量上传知识库数据到向量数据库

```bash
npm run upload-knowledge
```

**工作流程**：
1. 📖 读取 `data/knowledge-base.json` 文件
2. 🤖 使用TensorFlow模型进行文本向量化
3. 💾 将向量数据批量插入Supabase
4. 🧪 自动执行上传后测试
5. 📊 生成详细的统计报告

**数据格式要求**：
```json
[
  {
    "category": "任务管理",
    "title": "用户表达记录意图",
    "content": "当用户说'记一下'、'mark'等词语时...",
    "keywords": ["记一下", "记录", "提醒", "mark"],
    "action": "创建新的待办任务"
  }
]
```

**输出示例**：
```
🚀 开始RAG+LangChain知识库上传流程...

📚 读取到 15 条知识条目

🔄 处理第 1/15 条: 用户表达记录意图
📝 向量化文本: 类别：任务管理。标题：用户表达记录意图...
📐 生成向量维度: 384
✅ 成功插入: 用户表达记录意图

==================================================
🎉 知识库上传完成!
✅ 成功: 15 条
❌ 失败: 0 条

🔍 测试向量搜索功能...
📋 找到 3 条相关知识:
  1. 标题: 用户表达记录意图
     类别: 任务管理
     相似度: 87.2%
```

**注意事项**：
- 确保知识库文件格式正确
- 向量化过程可能需要几分钟时间
- 自动添加200ms延迟防止API限流

---

### 🔍 搜索测试 - testSearch.mjs

**功能**：测试RAG检索功能的准确性和性能

```bash
npm run test-search
```

**测试内容**：
1. **查询策略对比**：直接查询 vs 增强查询 vs 关键词查询
2. **性能基准测试**：多次迭代测量响应时间
3. **知识库覆盖分析**：统计数据分布和类别覆盖
4. **相似度评估**：验证检索结果的相关性

**测试用例**：
- 简单任务添加：`"记一下明天要做的事"`
- 复杂情感表达：`"最近总是忘记事儿，帮我安排下日常吧"`
- 情绪支持查询：`"心情不好该做什么"`
- 具体任务列表：`"帮我mark一下：买菜、做饭、洗衣服"`

**输出示例**：
```
🔍 查询策略对比测试

🎯 测试用例: 简单任务添加请求
原始查询: "记一下明天要做的事"

🧠 检测到的意图: task_add

  📝 直接查询方式: "记一下明天要做的事"
    ✅ 直接查询找到 3 条结果 (向量化: 156ms, 搜索: 45ms):
      1. 用户表达记录意图 (89.4%)
         类别: 任务管理 | 建议: 创建新的待办任务
         
🚀 性能基准测试

⏱️ 测试查询: "mark一下明天的会议"
  平均耗时: 234.5ms | 最快: 198ms | 最慢: 267ms

📊 性能总结: 平均响应时间 245.8ms
```

**分析指标**：
- **响应时间**：向量化 + 搜索的总耗时
- **相似度分数**：语义匹配的准确性 (0-100%)
- **召回率**：相关结果的覆盖程度
- **一致性**：多次查询结果的稳定性

---

## 🛠️ 高级用法

### 环境变量配置

```env
# .env.local
DEEPSEEK_API_KEY=sk-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx
```

### 自定义配置

各脚本支持通过环境变量进行自定义：

```bash
# 修改向量维度（默认384）
VECTOR_DIMENSION=512 npm run upload-knowledge

# 调整相似度阈值（默认0.1）
SIMILARITY_THRESHOLD=0.15 npm run test-search

# 增加性能测试迭代次数（默认5）
BENCHMARK_ITERATIONS=10 npm run test-search
```

### 批量操作

```bash
# 完整的系统检查和数据初始化流程
npm run system-diagnosis && \
npm run upload-knowledge && \
npm run test-search
```

## 🚨 故障排查

### 常见问题

1. **向量化模型加载失败**
   ```
   ❌ 模型加载失败: Cannot find module '@tensorflow/tfjs-node'
   ```
   **解决**：`npm install @tensorflow/tfjs-node @tensorflow-models/universal-sentence-encoder`

2. **Supabase连接失败**
   ```
   ❌ 连接失败: Invalid API key
   ```
   **解决**：检查 `.env.local` 中的 `SUPABASE_URL` 和 `SUPABASE_KEY`

3. **知识库文件不存在**
   ```
   ❌ 知识库文件不存在: data/knowledge-base.json
   ```
   **解决**：创建知识库文件或参考 `data/knowledge-base.example.json`

4. **权限错误**
   ```
   ❌ EACCES: permission denied
   ```
   **解决**：确保脚本有执行权限 `chmod +x scripts/*.mjs`

### 调试模式

```bash
# 启用详细日志
DEBUG=1 npm run upload-knowledge

# 使用开发环境配置
NODE_ENV=development npm run test-search
```

## 📈 性能优化建议

1. **向量化性能**：
   - 首次运行会下载模型，后续运行会更快
   - 批量处理时使用适当的延迟避免内存溢出

2. **数据库性能**：
   - 定期清理测试数据
   - 使用适当的相似度阈值平衡精度和召回率

3. **网络优化**：
   - 在良好网络环境下运行脚本
   - 考虑使用代理加速模型下载

## 🔄 定期维护

建议定期运行以下维护任务：

```bash
# 每周系统健康检查
npm run system-diagnosis

# 每月性能基准测试
npm run test-search

# 知识库更新后重新上传
npm run upload-knowledge
```

---

## 📞 技术支持

如果遇到问题，请按以下顺序排查：

1. 🔍 运行系统诊断：`npm run system-diagnosis`
2. 📚 查看详细错误日志
3. 🔧 根据诊断报告修复配置问题
4. 🧪 使用测试脚本验证修复效果

祝您使用愉快！🎉 