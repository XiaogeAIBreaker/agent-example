# Next.js 教学案例集合

本项目包含多个 Next.js 实战教学案例，每个案例都是一个完整的可运行项目。

## 📁 项目结构

```
agent-example/
├── examples/
│   ├── 01-chat-bot/          # DeepSeek 聊天机器人
│   └── 02-todolist/          # Todo List 应用
└── README.md                 # 项目说明
```

## 🚀 快速开始

每个示例项目都有独立的依赖和配置，使用方法：

1. 进入对应的示例目录
2. 安装依赖：`npm install`
3. 配置环境变量（如需要）
4. 启动开发服务器：`npm run dev`

## 📚 案例列表

### 01. DeepSeek 聊天机器人
- **技术栈**：Next.js 14 + Vercel AI SDK v4 + DeepSeek API
- **功能**：实时对话、流式响应、中文支持
- **目录**：`examples/01-chat-bot/`

### 02. Todo List 应用
- **技术栈**：Next.js 14 + TypeScript + TailwindCSS
- **功能**：任务管理、本地存储、响应式设计
- **目录**：`examples/02-todolist/`

## 🛠️ 技术特性

- ✅ Next.js 14 App Router
- ✅ TypeScript 支持
- ✅ 响应式设计
- ✅ 模块化架构
- ✅ 最佳实践示例

## 📖 学习路径

建议按照数字顺序学习各个案例，每个案例都会引入新的概念和技术点。

---

**作者**：bytedance  
**更新时间**：2025年6月 

# 📝 Todo List 应用

这是一个使用 Next.js 14 和 TypeScript 构建的现代化 Todo List 应用。

## ✨ 功能特性

- ✅ **任务管理**：添加、编辑、删除、完成任务
- 🔍 **任务过滤**：查看全部、进行中、已完成的任务
- 💾 **本地存储**：使用 localStorage 持久化数据
- 📱 **响应式设计**：适配桌面和移动设备
- 🎨 **现代 UI**：使用 TailwindCSS 设计美观界面
- ⌚ **时间记录**：显示任务创建时间
- 📊 **统计信息**：显示任务完成情况统计

## 🚀 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：TailwindCSS
- **状态管理**：React Hooks (useState, useEffect)
- **数据持久化**：localStorage
- **开发工具**：ESLint

## 📱 使用方法

### 添加任务
- 在输入框中输入任务内容
- 点击"添加"按钮或按 Enter 键

### 管理任务
- **完成任务**：点击任务前的圆圈
- **编辑任务**：双击任务文本或点击"编辑"按钮
- **删除任务**：点击"删除"按钮

### 过滤任务
- **全部**：显示所有任务
- **进行中**：只显示未完成的任务
- **已完成**：只显示已完成的任务

### 批量操作
- **清除已完成**：一键删除所有已完成的任务

## 🏗️ 项目结构

```
02-todolist/
├── app/
│   ├── page.tsx          # 主页面组件
│   ├── layout.tsx        # 布局组件
│   └── globals.css       # 全局样式
├── public/               # 静态资源
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 🔧 主要组件

### TodoList 组件
主要的应用组件，包含：
- 状态管理 (todos, inputText, filter)
- 任务操作函数 (添加、编辑、删除、切换状态)
- 数据持久化逻辑
- UI 渲染

### TodoItem 组件
单个任务项组件，包含：
- 编辑状态管理
- 任务展示和编辑功能
- 操作按钮

## 🎯 学习要点

这个项目演示了以下前端开发概念：

1. **React Hooks**：useState 和 useEffect 的使用
2. **TypeScript**：接口定义和类型安全
3. **TailwindCSS**：实用优先的 CSS 框架
4. **本地存储**：localStorage 的使用
5. **组件化**：函数组件的设计
6. **事件处理**：用户交互处理
7. **条件渲染**：根据状态动态显示内容
8. **列表渲染**：数组数据的展示

## 🚧 扩展功能 (可选实现)

- [ ] 添加任务分类/标签
- [ ] 支持任务优先级
- [ ] 添加截止日期
- [ ] 支持任务搜索
- [ ] 添加主题切换
- [ ] 支持拖拽排序
- [ ] 添加任务详情页
- [ ] 集成后端 API

## 📚 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [React Hooks 文档](https://react.dev/reference/react)

---

**作者**：bytedance  
**创建时间**：2025年6月  
**技术栈**：Next.js 14 + TypeScript + TailwindCSS 