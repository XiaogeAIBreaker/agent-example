"use client";

import { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 根据 status 计算加载状态
  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="container">
      <div className="header">
        <h1>DeepSeek 聊天机器人</h1>
        <p>基于 Vercel AI SDK 的智能对话助手</p>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
              <p>👋 你好！我是 DeepSeek 聊天机器人</p>
              <p>有什么我可以帮助你的吗？</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content loading">
                正在思考中...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="input-container">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="输入你的消息..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            发送
          </button>
        </form>
      </div>
    </div>
  );
} 