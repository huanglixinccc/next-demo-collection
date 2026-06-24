/**
 * 主题 Provider 组件
 * 包裹 next-themes，配置 class 模式切换，默认暗色主题
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

/** 主题上下文 Provider，子组件可通过 useTheme 访问当前主题 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
