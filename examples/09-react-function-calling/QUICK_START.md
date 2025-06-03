# 🚀 快速启动指南

## 1. 环境准备

### 安装依赖
```bash
cd examples/08-function-calling
npm install
```

### 配置API Key
1. 复制环境变量示例文件：
   ```bash
   cp env.example .env.local
   ```

2. 编辑 `.env.local` 文件，添加你的 DeepSeek API Key：
   ```env
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

3. 获取API Key：访问 [DeepSeek Platform](https://platform.deepseek.com/) 注册并获取API Key

## 2. 启动应用

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 3. 功能测试

### 基础操作测试
1. **添加任务**：
   - 输入："帮我添加一个学习Python的任务"
   - 预期：AI调用addTodo函数，任务被添加

2. **完成任务**：
   - 输入："完成刚才那个任务"
   - 预期：AI调用completeTodo函数，任务被标记为完成

3. **删除任务**：
   - 输入："删除学习Python任务"
   - 预期：AI调用deleteTodo函数，任务被删除

### 上下文测试
1. **连续操作**：
   ```
   用户: "添加买菜任务"
   AI: [调用addTodo] 已添加任务
   
   用户: "再加一个类似的"
   AI: [调用addTodo] 添加了相关任务
   
   用户: "完成第一个"
   AI: [调用completeTodo] 完成了买菜任务
   ```

2. **批量操作**：
   ```
   用户: "清除所有已完成的任务"
   AI: [调用clearCompleted] 清除完成
   ```

## 4. 界面功能

### 主要区域
- **左侧**：待办事项列表和操作
- **右侧**：AI助手对话界面

### 特殊功能
- **上下文视图**：点击"📋 上下文"查看Token使用情况
- **执行结果**：实时显示Function Calling的执行结果
- **Token监控**：实时显示Token使用量和警告

## 5. 调试模式

### 查看Function Calling日志
打开浏览器开发者工具（F12），在Console中查看：
- Tool call接收日志
- 指令映射结果
- 执行结果

### 常见问题排查
1. **API Key错误**：检查.env.local文件配置
2. **函数不执行**：查看Console中的错误信息
3. **上下文丢失**：检查Token使用量是否超限

## 6. 高级使用

### 复杂指令示例
```
"帮我添加三个学习任务：Python、JavaScript和React，然后完成第一个"
```

### 批量操作
```
"清除所有任务，然后添加今天的工作计划"
```

### 条件操作
```
"如果有超过5个任务，就清除已完成的"
```

## 7. 与07版本对比

| 功能 | 07版本 | 08版本 |
|------|--------|--------|
| 指令解析 | JSON解析 | Function Calling |
| 类型安全 | 手动验证 | Zod自动验证 |
| AI理解 | 学习JSON格式 | 原生函数理解 |
| 扩展性 | 修改解析器 | 添加工具定义 |

## 8. 下一步

- 查看 [FUNCTION_CALLING_GUIDE.md](./FUNCTION_CALLING_GUIDE.md) 了解详细技术实现
- 尝试添加自定义工具函数
- 探索更复杂的上下文交互场景

🎉 享受Function Calling带来的强大功能！ 