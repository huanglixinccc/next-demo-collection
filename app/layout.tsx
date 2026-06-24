/**
 * 根布局
 * 配置全局字体、主题 Provider、元数据，包裹所有页面
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

/** Geist 无衬线字体 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Geist Mono 等宽字体 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** 全局元数据：标题和描述 */
export const metadata: Metadata = {
  title: "Next Demo Collection",
  description: "个人 Demo 集合平台",
};

/** 根布局组件，配置 HTML lang、字体变量、主题 Provider */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
