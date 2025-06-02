import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DeepSeek 聊天机器人',
  description: '基于 Vercel AI SDK 和 DeepSeek 的简易聊天机器人',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
} 