import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent CoT - Chain of Thought 智能待办事项",
  description: "基于Chain of Thought模式的智能任务助手，展示透明化决策过程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
