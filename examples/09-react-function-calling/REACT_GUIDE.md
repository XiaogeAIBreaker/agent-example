# ReAct + Function Calling 教学指南

## 🎯 什么是ReAct模式

ReAct是"Reasoning and Acting"的缩写，是一种让AI系统通过**推理**和**行动**循环来解决复杂任务的框架。

### 核心循环：Thought → Action → Observation

1. **Thought (思考)**: AI分析当前情况，制定下一步计划
2. **Action (行动)**: AI执行具体的函数调用
3. **Observation (观察)**: AI获取执行结果，决定是否继续

## 🚀 本项目的ReAct实现

### 系统架构

```
用户输入："写日报前先完成当前的任务"
    ↓
AI Thought: 需要先查询当前任务
    ↓
AI Action: 调用 queryCurrentTasks()
    ↓
AI Observation: 获取任务列表结果
    ↓
AI Thought: 需要完成这些任务
    ↓
AI Action: 调用 completeAllTasks()
    ↓
AI Observation: 确认任务完成
    ↓
AI Thought: 现在可以写日报了
    ↓
AI Action: 调用 generateDailyReport()
    ↓
AI Final: 汇总整个执行过程
```

### 关键特性

1. **多步任务规划**: 自动拆解复杂任务为多个步骤
2. **上下文保持**: 在多个步骤间维护状态
3. **推理可视化**: 完整展示AI的思考过程
4. **错误恢复**: 根据观察结果调整后续行动

## 📝 新增的多步任务函数

### 1. queryCurrentTasks()
```typescript
// 查询当前未完成任务
queryCurrentTasks(includeCompleted?: boolean)
```
- 用途：获取当前任务状态，为后续步骤提供信息
- 返回：任务列表和统计信息

### 2. completeAllTasks()
```typescript
// 批量完成所有任务
completeAllTasks(confirmMessage?: string)
```
- 用途：一次性完成所有未完成任务
- 支持确认消息

### 3. generateDailyReport()
```typescript
// 生成日报任务
generateDailyReport(reportType?: 'daily' | 'weekly' | 'summary')
```
- 用途：根据当前任务状态生成报告任务
- 支持不同类型的报告

### 4. taskSummary()
```typescript
// 获取任务摘要
taskSummary(detailed?: boolean)
```
- 用途：生成任务执行的详细摘要
- 支持详细模式和简要模式

## 🎮 测试用例

### 基础ReAct流程
```
用户: "写日报前先完成当前的任务"

AI执行流程:
1. Thought: 分析用户需求，需要分步执行
2. Action: queryCurrentTasks() - 查询当前任务
3. Observation: 发现有3个未完成任务
4. Thought: 需要先完成这些任务
5. Action: completeAllTasks() - 完成所有任务
6. Observation: 所有任务已完成
7. Thought: 现在可以生成日报
8. Action: generateDailyReport() - 添加日报任务
9. Final: 汇总执行结果告知用户
```

### 复杂多步任务
```
用户: "帮我整理一下所有任务，完成能完成的，然后做个汇报"

AI执行流程:
1. Thought: 需要先了解当前任务状态
2. Action: taskSummary(detailed: true) - 获取详细摘要
3. Observation: 分析任务分布情况
4. Thought: 根据任务情况决定操作
5. Action: completeAllTasks() - 完成可以完成的任务
6. Observation: 确认完成结果
7. Thought: 生成最终汇报
8. Action: generateDailyReport(reportType: 'summary')
9. Final: 提供完整的整理报告
```

## 💡 技术实现细节

### 1. 系统提示词设计
```typescript
const systemPrompt = `你是一个智能ReAct助手，使用ReAct模式执行多步任务规划。

## ReAct执行模式：
你需要按照 **Thought → Action → Observation** 的循环模式来解决复杂任务：

1. **Thought(思考)**: 分析当前情况，制定下一步计划
2. **Action(行动)**: 调用相应的函数执行具体操作  
3. **Observation(观察)**: 获取函数执行结果，分析是否需要继续
`;
```

### 2. 函数映射增强
```typescript
// 新增多步任务函数工具定义
tools: {
  queryCurrentTasks: {
    description: 'Query current uncompleted tasks - useful for multi-step planning',
    parameters: z.object({
      includeCompleted: z.boolean().optional()
    })
  },
  // ... 其他工具
}
```

### 3. 推理链可视化
- 实时显示每个ReAct步骤
- 展示函数调用详情
- 显示执行结果和AI观察

## 🔧 扩展建议

### 1. 条件分支推理
```typescript
// 支持基于观察结果的条件执行
if (taskCount > 10) {
  // 分批处理逻辑
} else {
  // 直接处理逻辑
}
```

### 2. 错误恢复机制
```typescript
// 当某个Action失败时的恢复策略
onActionFailure: (error) => {
  // 重新Thought，调整策略
  return alternativeAction();
}
```

### 3. 并行Action支持
```typescript
// 同时执行多个独立的Action
await Promise.all([
  queryCurrentTasks(),
  taskSummary()
]);
```

## 📚 学习要点

1. **ReAct模式理解**: 掌握推理与行动的循环机制
2. **多步规划**: 学会将复杂任务拆解为简单步骤
3. **上下文维护**: 在多步骤间保持状态一致性
4. **可观测性**: 让AI的思考过程对用户透明
5. **错误处理**: 优雅处理执行过程中的异常情况

这个ReAct实现展示了如何构建更智能、更透明的AI交互系统，为复杂任务的自动化处理提供了强大的框架。 