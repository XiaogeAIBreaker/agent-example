# DeepSeek 聊天机器人

基于 Vercel AI SDK、Next.js 和 DeepSeek 模型构建的简易聊天机器人。

## ✨ 功能特点

- 🤖 集成 DeepSeek 大语言模型
- 💬 实时流式对话
- 🎨 现代化 UI 设计
- 📱 响应式布局
- ⚡ 基于 Next.js App Router

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env.local` 文件并添加你的 DeepSeek API 密钥：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

> 💡 你可以在 [DeepSeek 官网](https://platform.deepseek.com/) 获取 API 密钥

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
├── app/
│   ├── api/chat/route.ts    # 聊天 API 路由
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 主页面
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🛠️ 技术栈

- **Next.js 14** - React 全栈框架
- **Vercel AI SDK** - AI 应用开发工具包
- **DeepSeek** - 大语言模型
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

## 📝 使用说明

1. 在聊天界面输入你的问题
2. 点击"发送"按钮或按回车键
3. 等待 DeepSeek 模型的回复
4. 享受智能对话体验！

## 🔧 自定义配置

你可以在 `app/api/chat/route.ts` 中自定义：

- 模型参数
- 系统提示词
- 流式响应配置

## 📄 许可证

ISC