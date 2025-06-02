import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简单指令执行 - AI 待办助手",
  description: "一个演示自然语言到JSON指令执行的简单案例",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        {children}
      </body>
    </html>
  );
} 