"use client";

// 导入必要的 React hooks
import { useRef, useEffect } from 'react';
// 导入 Vercel AI SDK 的 useChat hook，用于管理聊天状态
import { useChat } from '@ai-sdk/react';

/**
 * 聊天机器人主组件
 * 使用 Vercel AI SDK 实现与 AI 的对话功能
 */
export default function Chat() {
  /**
   * useChat hook 返回的聊天状态和操作方法
   * @param {string} api - API 端点路径，指向 /api/chat
   * @returns {object} 包含以下属性：
   *   - messages: 消息历史数组，包含用户和AI的对话记录
   *   - input: 当前输入框的文本内容
   *   - handleInputChange: 处理输入框内容变化的函数
   *   - handleSubmit: 处理表单提交的函数
   *   - status: 当前聊天状态 ('idle' | 'submitted' | 'streaming' | 'error')
   */
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat', // 指定聊天API的端点
  });
  
  /**
   * 创建对消息容器底部元素的引用
   * 用于实现自动滚动到最新消息的功能
   */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 根据聊天状态计算是否正在加载
   * - submitted: 消息已提交，等待AI响应
   * - streaming: 正在流式接收AI响应
   */
  const isLoading = status === 'submitted' || status === 'streaming';

  /**
   * 滚动到消息容器底部的函数
   * 使用平滑滚动效果，确保用户能看到最新的消息
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 监听消息数组变化，自动滚动到底部
   * 每当有新消息时，自动滚动到最新消息位置
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // 依赖项：messages 数组

  return (
    <div className="container">
      {/* 页面头部区域 */}
      <div className="header">
        <h1>DeepSeek 聊天机器人</h1>
        <p>基于 Vercel AI SDK 的智能对话助手</p>
      </div>
      
      {/* 聊天主容器 */}
      <div className="chat-container">
        {/* 消息显示区域 */}
        <div className="messages-container">
          {/* 空状态：当没有消息时显示欢迎信息 */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              <p>👋 你好！我是 DeepSeek 聊天机器人</p>
              <p>有什么我可以帮助你的吗？</p>
            </div>
          )}
          
          {/* 渲染所有历史消息 */}
          {messages.map((message) => (
            <div
              key={message.id} // 使用消息ID作为React key，确保列表渲染性能
              className={`message ${message.role}`} // 根据消息角色（user/assistant）应用不同样式
            >
              <div className="message-content">
                {message.content} {/* 显示消息内容 */}
              </div>
            </div>
          ))}
          
          {/* 加载状态：当AI正在思考时显示加载提示 */}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content loading">
                正在思考中...
              </div>
            </div>
          )}
          
          {/* 滚动目标元素：用于自动滚动到底部 */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 输入表单区域 */}
        <form onSubmit={handleSubmit} className="input-container">
          <input
            value={input} // 绑定输入框的值
            onChange={handleInputChange} // 绑定输入变化处理函数
            placeholder="输入你的消息..." // 占位符文本
            disabled={isLoading} // 加载时禁用输入框
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} // 加载时或输入为空时禁用按钮
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
} 