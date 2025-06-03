# 🧠 Agent CoT - 思考过程可视化

## 📚 教学案例11 | 基于Agent Loop引入Chain of Thought

> 基于10-agent-loop进行迭代升级，引入**Chain of Thought (CoT)**模式，实现"思考过程 + 可执行指令"的双重结构输出。

---

## 🎯 教学目标

在保留 Agent Loop 的多轮闭环执行机制的基础上，新增 Chain of Thought（CoT）输出，使 Agent 每轮决策具备**"思考过程 + 可执行指令"**的双重结构。

## 🧠 核心理念

**CoT + Agent Loop** = 透明化的智能决策过程：

1. **思考阶段**：AI先分析问题、制定计划
2. **行动阶段**：执行具体的函数调用
3. **反思阶段**：基于结果判断下一步
4. **循环执行**：直至目标完成

---

## 🧩 教学用例升级设计

### 📌 主题：帮我安排今天最重要的三件事

**💬 用户输入（Prompt）：**
```
今天任务很多，帮我安排出最重要的三件，并说明为什么这么安排。
```

**🧠 模型输出（CoT + Loop-ready JSON）：**
```json
{
  "thought": "根据经验，优先级应考虑任务的截止时间、紧急程度和依赖关系。今天需要完成的包括：提交月报、进行版本上线、准备晚上的会议汇报。提交月报临近截止最为紧急，版本上线涉及多团队协调，会议汇报时间在晚上但内容准备量大，因此这三项最优先。",
  "actions": [
    {
      "tool": "addTodo",
      "args": {
        "task": "提交月报"
      }
    },
    {
      "tool": "addTodo", 
      "args": {
        "task": "协调版本上线"
      }
    },
    {
      "tool": "addTodo",
      "args": {
        "task": "准备会议汇报材料"
      }
    }
  ]
}
```

---

## 🛠️ 技术实现要点

### 1. 升级的 Zod Schema（支持 thought + actions）

```typescript
const schema = z.object({
  thought: z.string().optional().describe('AI的思考过程和分析推理'),
  actions: z.array(
    z.object({
      tool: z.string().describe('要调用的工具名称'),
      args: z.record(z.any()).describe('工具调用参数')
    })
  ).describe('要执行的操作列表')
});
```

### 2. 升级的系统提示词（CoT 引导模板）

```typescript
const systemPrompt = `
你是一个任务管理智能体，具备透明化思考能力。

请按以下JSON格式输出你的响应：

{
  "thought": "你的分析思考过程...",
  "actions": [
    {
      "tool": "工具名称",
      "args": { "参数": "值" }
    }
  ]
}

思考过程应该包括：
- 对用户请求的理解和分析
- 任务优先级的判断依据
- 执行计划的制定逻辑
- 预期结果的评估

然后基于思考结果，生成具体的可执行指令。
`;
```

### 3. 处理逻辑升级

```typescript
async function handleCoTResponse(response) {
  const { thought, actions } = schema.parse(response);

  // 展示思考过程
  if (thought) {
    console.log('🤖 Agent 思考过程：', thought);
    // 可传回前端 UI 显示
  }

  // 执行行动序列
  for (const action of actions) {
    const toolFn = toolsMap[action.tool];
    const result = await toolFn(action.args);
    console.log(`✅ 执行结果：`, result);
  }
}
```

---

## 🎯 与Agent Loop的关键差异

| 特性 | 10-agent-loop | 11-agent-cot |
|-----|---------------|---------------|
| **输出结构** | 自然语言 + 函数调用 | thought + actions JSON |
| **思考过程** | 隐式推理 | 显式思考过程 |
| **可观测性** | 行为可见 | 思维过程可见 |
| **调试友好度** | 中等 | 高 |
| **用户体验** | 执行结果导向 | 思考过程导向 |

---

## 🚀 快速开始

### 1. 环境配置
```bash
cd examples/11-agent-cot
npm install
```

### 2. 配置API密钥
```bash
cp env.example .env.local
# 编辑 .env.local 添加你的 DEEPSEEK_API_KEY
```

### 3. 启动应用
```bash
npm run dev
```

---

## 💡 推荐测试用例

### 复杂优先级排序
```
"今天有很多任务，帮我安排出最重要的三件事，并说明为什么这么安排"
```

### 条件决策
```
"如果当前待办超过5个，就先完成最紧急的3个，否则添加学习任务"
```

### 批量处理决策
```
"分析当前任务列表，把所有学习相关的任务完成，然后添加新的工作任务"
```

---

## 🎓 学习收获

通过本案例，你将掌握：

1. **CoT模式设计**: 如何让AI展示思考过程
2. **结构化输出**: JSON格式的思考+行动双重结构
3. **透明化决策**: 让AI的推理过程可视化
4. **可观测性提升**: 便于调试和优化AI行为
5. **用户体验优化**: 从结果导向到过程导向

---

## 🔗 相关资源

- [10-agent-loop](../10-agent-loop/README.md) - 前置教学案例
- [Chain of Thought论文](https://arxiv.org/abs/2201.11903) - 理论基础
- [CoT最佳实践](./COT_GUIDE.md) - 技术指南

---

**🎯 教学重点**: 从黑盒执行到透明决策，体验AI思维过程的可视化！
