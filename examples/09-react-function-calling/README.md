# 09-react-function-calling - ReAct + Function Calling 联合实战

基于08-function-calling项目迭代，实现ReAct模式的多步任务规划与执行。

## 🎯 教学目标

- **多步任务规划**: AI自动拆解复杂任务为多个步骤
- **多次函数调用**: 支持连续的function calling执行
- **汇总执行结果**: 整合多步执行的结果并反馈给用户

## ✅ 核心示例场景

用户说："写日报前先完成当前的任务"

AI执行流程：
1. **思考阶段(Thought)**: 分析用户需求，需要先查询任务再完成再写日报
2. **行动阶段(Action)**: 调用查询当前任务列表函数
3. **观察阶段(Observation)**: 获取任务列表结果
4. **思考阶段(Thought)**: 根据任务列表，决定完成所有未完成任务
5. **行动阶段(Action)**: 调用完成全部任务函数
6. **观察阶段(Observation)**: 确认任务完成结果
7. **思考阶段(Thought)**: 现在可以写日报了
8. **行动阶段(Action)**: 调用添加日报任务函数
9. **最终回复**: 汇总所有执行结果

## 🚀 新增功能

### ReAct推理链展示
- 实时显示AI的**思考过程(Thought)**
- 展示每个**行动步骤(Action)**及其**观察结果(Observation)**
- 完整的推理链可视化

### 多步任务函数
- `queryCurrentTasks()`: 查询当前未完成任务
- `completeAllTasks()`: 批量完成全部任务
- `generateDailyReport()`: 生成日报任务
- `planMultiStep()`: 多步任务规划

### 增强的UI展示
- ReAct推理链实时展示
- 执行步骤进度显示
- 任务执行结果汇总

## 💡 技术亮点

1. **ReAct模式实现**: Reasoning + Acting的循环执行
2. **Function Calling链**: 支持多个函数的连续调用
3. **上下文保持**: 维护多步骤之间的状态传递
4. **可视化推理**: 将AI思考过程完整展示给用户

## 🛠️ 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp env.example .env.local
# 在.env.local中配置你的DeepSeek API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 体验ReAct + Function Calling联合实战。

## 📝 测试指令

- "写日报前先完成当前的任务"
- "先查看有什么任务，然后全部完成，最后添加一个总结任务"
- "帮我整理一下所有任务，完成能完成的，然后做个汇报"

每个指令都会触发多步ReAct执行流程，展示完整的推理和行动过程。
