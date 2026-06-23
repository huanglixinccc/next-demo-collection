# AI 新闻 Tab 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个 Next.js Demo 集合平台，第一个 Tab 为 AI 热门新闻展示，通过 RSS 聚合多个 AI 资讯源。

**Architecture:** Next.js App Router + ISR 每日刷新 RSS 数据。顶部 Tab 栏切换不同 demo，暗色/亮色主题切换。API 层预留统一中间件和响应格式供后续扩展。

**Tech Stack:** Next.js 14+, Tailwind CSS, next-themes, rss-parser, TypeScript

---

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: 项目根目录下所有初始文件（由 create-next-app 生成）

- [ ] **Step 1: 使用 create-next-app 初始化项目**

在工作区根目录执行（会先清空已有文件）：

```bash
cd /Users/huanglixin/Desktop/workspace/next-demo-collection
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --yes
```

- [ ] **Step 2: 安装额外依赖**

```bash
npm install next-themes rss-parser
```

- [ ] **Step 3: 验证项目可运行**

```bash
npm run dev
```

Expected: 看到 Next.js 默认首页在 `http://localhost:3000` 正常加载。然后 `Ctrl+C` 停止。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: init Next.js project with Tailwind CSS"
```

---

### Task 2: 类型定义与 RSS 配置

**Files:**
- Create: `lib/types.ts`
- Create: `lib/rss-config.ts`

- [ ] **Step 1: 创建类型定义**

创建 `lib/types.ts`：

```ts
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceIcon?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface RssSource {
  name: string;
  url: string;
}

export interface TabConfig {
  id: string;
  label: string;
}
```

- [ ] **Step 2: 创建 RSS 源配置**

创建 `lib/rss-config.ts`：

```ts
import { RssSource } from "./types";

export const RSS_SOURCES: RssSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "机器之心",
    url: "https://www.jiqizhixin.com/rss",
  },
];
```

- [ ] **Step 3: 提交**

```bash
git add lib/
git commit -m "feat: add type definitions and RSS source config"
```

---

### Task 3: RSS 解析逻辑

**Files:**
- Create: `lib/rss.ts`

- [ ] **Step 1: 实现 RSS 解析核心逻辑**

创建 `lib/rss.ts`：

```ts
import Parser from "rss-parser";
import { createHash } from "crypto";
import { NewsItem } from "./types";
import { RSS_SOURCES } from "./rss-config";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NextDemoCollection/1.0",
  },
});

function generateId(url: string): string {
  return createHash("md5").update(url).digest("hex").slice(0, 12);
}

function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1];
}

function truncateText(text: string, maxLength: number): string {
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + "..." : cleaned;
}

async function fetchSingleSource(source: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).map((item) => ({
      id: generateId(item.link || item.guid || item.title || ""),
      title: item.title || "无标题",
      summary: truncateText(item.contentSnippet || item.content || "", 200),
      source: source.name,
      sourceIcon: undefined,
      url: item.link || "",
      imageUrl: item.enclosure?.url || extractImageFromContent(item.content || ""),
      publishedAt: item.isoDate || new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSingleSource(source))
  );

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // 去重（基于 id）
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // 按发布时间倒序
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return unique;
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/rss.ts
git commit -m "feat: add RSS parsing logic with multi-source aggregation"
```

---

### Task 4: API 共享层

**Files:**
- Create: `app/api/_shared/response.ts`
- Create: `app/api/_shared/middleware.ts`

- [ ] **Step 1: 创建统一响应工具**

创建 `app/api/_shared/response.ts`：

```ts
import { NextResponse } from "next/server";

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export function success<T>(data: T, message = "success"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: 200,
    message,
    data,
  });
}

export function error(message: string, code = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code,
      message,
      data: null,
    },
    { status: code }
  );
}
```

- [ ] **Step 2: 创建共享中间件**

创建 `app/api/_shared/middleware.ts`：

```ts
import { NextRequest } from "next/server";

export function withCors(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export function logRequest(request: NextRequest): void {
  const { method, nextUrl } = request;
  console.log(`[API] ${method} ${nextUrl.pathname} - ${new Date().toISOString()}`);
}

export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

- [ ] **Step 3: 提交**

```bash
git add app/api/_shared/
git commit -m "feat: add API shared layer (response utils, middleware)"
```

---

### Task 5: RSS API 路由

**Files:**
- Create: `app/api/rss/route.ts`

- [ ] **Step 1: 创建 RSS API 路由**

创建 `app/api/rss/route.ts`：

```ts
import { NextRequest } from "next/server";
import { fetchAllNews } from "@/lib/rss";
import { success, error } from "../_shared/response";
import { withCors, logRequest, handleOptions } from "../_shared/middleware";

export async function GET(request: NextRequest) {
  logRequest(request);

  try {
    const news = await fetchAllNews();
    const response = success(news, `共 ${news.length} 条新闻`);
    return withCors(response);
  } catch (err) {
    const response = error("获取新闻失败，请稍后重试", 500);
    return withCors(response);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/rss/
git commit -m "feat: add RSS API route"
```

---

### Task 6: 主题系统（暗色/亮色）

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/ThemeProvider.tsx`
- Create: `components/ThemeToggle.tsx`

- [ ] **Step 1: 创建 ThemeProvider**

创建 `components/ThemeProvider.tsx`：

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 2: 创建 ThemeToggle 组件**

创建 `components/ThemeToggle.tsx`：

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="切换主题"
    >
      {theme === "dark" ? (
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 3: 更新 globals.css**

替换 `app/globals.css` 全部内容：

```css
@import "tailwindcss";

:root {
  --foreground: #171717;
  --background: #ffffff;
}

.dark {
  --foreground: #ededed;
  --background: #0a0a0a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
```

- [ ] **Step 4: 更新 layout.tsx**

替换 `app/layout.tsx` 全部内容：

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Demo Collection",
  description: "个人 Demo 集合平台",
};

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
```

- [ ] **Step 5: 验证主题切换**

```bash
npm run dev
```

Expected: 页面默认暗色模式，右上角出现切换按钮。`Ctrl+C` 停止。

- [ ] **Step 6: 提交**

```bash
git add components/ThemeProvider.tsx components/ThemeToggle.tsx app/layout.tsx app/globals.css
git commit -m "feat: add dark/light theme system with toggle"
```

---

### Task 7: TabBar 组件

**Files:**
- Create: `components/TabBar.tsx`

- [ ] **Step 1: 创建 TabBar 组件**

创建 `components/TabBar.tsx`：

```tsx
"use client";

import { TabConfig } from "@/lib/types";

interface TabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/TabBar.tsx
git commit -m "feat: add TabBar component"
```

---

### Task 8: 新闻组件

**Files:**
- Create: `components/ai-news/NewsHeadline.tsx`
- Create: `components/ai-news/NewsListItem.tsx`
- Create: `components/ai-news/NewsSkeleton.tsx`
- Create: `components/ai-news/NewsFeed.tsx`

- [ ] **Step 1: 创建 NewsHeadline 头条卡片**

创建 `components/ai-news/NewsHeadline.tsx`：

```tsx
import { NewsItem } from "@/lib/types";

interface NewsHeadlineProps {
  item: NewsItem;
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours} 小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-CN");
}

export function NewsHeadline({ item }: NewsHeadlineProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
    >
      {item.imageUrl && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-xl font-bold mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {item.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
          {item.summary}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {item.source}
          </span>
          <time>{formatTime(item.publishedAt)}</time>
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: 创建 NewsListItem 列表项**

创建 `components/ai-news/NewsListItem.tsx`：

```tsx
import { NewsItem } from "@/lib/types";

interface NewsListItemProps {
  item: NewsItem;
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export function NewsListItem({ item }: NewsListItemProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-lg font-bold text-gray-400 dark:text-gray-500">
        {item.source.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
          {item.summary}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          {item.source}
        </span>
        <time className="text-xs text-gray-400 dark:text-gray-500">
          {formatTime(item.publishedAt)}
        </time>
      </div>
    </a>
  );
}
```

- [ ] **Step 3: 创建 NewsSkeleton 骨架屏**

创建 `components/ai-news/NewsSkeleton.tsx`：

```tsx
export function NewsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* 头条骨架 */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="flex gap-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          </div>
        </div>
      </div>
      {/* 列表骨架 */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="space-y-1 flex-shrink-0">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 创建 NewsFeed 聚合容器**

创建 `components/ai-news/NewsFeed.tsx`：

```tsx
import { NewsItem } from "@/lib/types";
import { NewsHeadline } from "./NewsHeadline";
import { NewsListItem } from "./NewsListItem";

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-lg font-medium mb-2">暂无新闻</p>
        <p className="text-sm">RSS 源暂时无法获取数据，请稍后再试</p>
      </div>
    );
  }

  const [headline, ...rest] = news;

  return (
    <div className="space-y-4">
      <NewsHeadline item={headline} />
      <div className="space-y-2">
        {rest.map((item) => (
          <NewsListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add components/ai-news/
git commit -m "feat: add news components (headline, list item, skeleton, feed)"
```

---

### Task 9: 组装首页

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 实现首页**

替换 `app/page.tsx` 全部内容：

```tsx
import { fetchAllNews } from "@/lib/rss";
import { TabConfig } from "@/lib/types";
import { TabBar } from "@/components/TabBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NewsFeed } from "@/components/ai-news/NewsFeed";

export const revalidate = 86400; // ISR: 每天重新验证

const TABS: TabConfig[] = [
  { id: "ai-news", label: "AI 新闻" },
  // 后续在这里添加更多 Tab
];

export default async function Home() {
  const news = await fetchAllNews();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Nest
            </h1>
            <TabBar
              tabs={TABS}
              activeTab="ai-news"
              onTabChange={() => {}}
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 内容区 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <NewsFeed news={news} />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 验证完整页面**

```bash
npm run dev
```

Expected: 页面显示暗色主题，顶部有 "Nest" logo + "AI 新闻" Tab + 主题切换按钮。主区域显示头条大卡片和列表新闻。`Ctrl+C` 停止。

- [ ] **Step 3: 提交**

```bash
git add app/page.tsx
git commit -m "feat: assemble homepage with AI news tab"
```

---

### Task 10: PM2 配置与构建验证

**Files:**
- Create: `ecosystem.config.js`
- Modify: `.gitignore`

- [ ] **Step 1: 创建 PM2 配置**

创建 `ecosystem.config.js`：

```js
module.exports = {
  apps: [{
    name: "next-demo",
    script: "npm",
    args: "start",
    env: {
      PORT: 3200,
    },
  }],
};
```

- [ ] **Step 2: 更新 .gitignore**

在 `.gitignore` 中追加：

```
.superpowers/
```

- [ ] **Step 3: 验证生产构建**

```bash
npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 4: 验证生产运行**

```bash
PORT=3200 npm start
```

在浏览器打开 `http://localhost:3200`，确认页面正常渲染。`Ctrl+C` 停止。

- [ ] **Step 5: 提交**

```bash
git add ecosystem.config.js .gitignore
git commit -m "chore: add PM2 config and update gitignore"
```

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "feat: complete AI news tab - first demo ready"
```
