# 带有 AI 助手的待办事项应用

这是一个结合了待办事项管理和 AI 聊天助手的 Next.js 应用程序。用户可以管理自己的待办事项，同时通过常驻的 AI 助手侧边栏获得实时帮助和建议。

## 功能特点

### 待办事项功能
- ✅ 添加新任务
- ✅ 标记任务完成/未完成
- ✅ 删除任务
- ✅ 查看任务统计（总计、已完成、剩余）
- ✅ 批量清除已完成任务
- ✅ 批量清除全部任务
- ✅ 响应式设计，支持深色模式

### AI 助手功能
- 🤖 常驻侧边栏，随时可用
- 🤖 智能聊天对话
- 🤖 待办事项管理建议
- 🤖 基于 DeepSeek API 的强大 AI 能力
- 🤖 实时流式响应
- 🤖 响应式设计（桌面端侧边栏，移动端下方）

## 技术栈

- **前端框架**: Next.js 15.3.2 with React 19
- **样式**: Tailwind CSS
- **AI SDK**: Vercel AI SDK with DeepSeek
- **语言**: TypeScript
- **开发工具**: ESLint

## 快速开始

### 1. 克隆项目

```bash
cd examples/03-todolist-with-chatbot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.local.example .env.local
```

然后编辑 `.env.local` 文件，添加你的 DeepSeek API 密钥：

```bash
# DeepSeek API Key
# 从 https://platform.deepseek.com/api_keys 获取
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 获取 DeepSeek API 密钥步骤：
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys)
2. 注册/登录账户
3. 点击"创建API密钥"
4. 复制生成的密钥到 `.env.local` 文件中

**注意**: 
- API密钥是敏感信息，请勿分享或提交到代码仓库
- `.env.local` 文件已在 `.gitignore` 中，不会被Git追踪

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
app/
├── api/
│   └── chat/
│       └── route.ts          # AI 聊天 API 路由
├── components/
│   └── ChatSidebar.tsx       # AI 助手侧边栏组件
├── globals.css               # 全局样式
├── layout.tsx               # 根布局
└── page.tsx                 # 主页面（待办事项 + AI 助手）
```

## 使用方法

### 管理待办事项
1. 在输入框中输入任务内容
2. 点击"添加"按钮或按回车键添加任务
3. 点击复选框标记任务完成
4. 点击垃圾桶图标删除任务
5. 使用底部按钮批量清除任务

### 使用 AI 助手
1. AI 助手位于页面右侧（桌面端）或下方（移动端），常驻可见
2. 直接在侧边栏的输入框中输入消息
3. AI 助手会为您提供实时帮助和建议
4. 支持关于待办事项管理的智能对话

## 界面特点

### 桌面端
- 左右分栏布局
- 左侧：待办事项管理区域
- 右侧：AI 助手常驻侧边栏（宽度 320px）

### 移动端
- 上下垂直布局
- 上方：待办事项管理区域
- 下方：AI 助手区域（高度 384px）

## 开发说明

这个项目是一个教学示例，展示了如何将独立的功能模块整合到一个完整的应用中：

1. **基础功能**: 从 `01-todolist` 项目继承的待办事项管理功能
2. **AI 集成**: 从 `02-chatbot` 项目移植的聊天机器人功能
3. **UI 集成**: 将聊天功能作为常驻侧边栏集成到主应用中
4. **功能协同**: AI 助手专门针对待办事项管理进行了优化
5. **响应式设计**: 适配桌面端和移动端的不同布局需求

## 故障排除

### 常见错误

#### 1. API 500 错误 - "POST /api/chat 500"
**原因**: DeepSeek API 密钥未配置或配置错误

**解决方案**:
1. 确保已创建 `.env.local` 文件
2. 检查 API 密钥是否正确填入
3. 重启开发服务器: `npm run dev`

```bash
# 检查环境变量文件是否存在
ls -la .env.local

# 检查文件内容（注意：请勿在公共场合执行此命令）
cat .env.local
```

#### 2. API 密钥相关错误
**检查项目**:
- API 密钥格式是否正确（通常以 `sk-` 开头）
- 账户余额是否充足
- API 密钥是否已过期

#### 3. 网络连接错误
如果遇到网络问题，请检查：
- 网络连接是否正常
- 是否需要配置代理
- DeepSeek 服务是否可用

## 许可证

MIT License
