# Next.js Demo Collection — AI 新闻 Tab 设计文档

## 项目概述

个人 Demo 集合平台，采用顶部 Tab 标签页组织不同的 demo 和小功能。第一个 Tab 为 AI 热门新闻展示，通过 RSS 聚合多个 AI 资讯源的内容。

**域名：** nest.hlxcccc.asia

## 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 14+ (App Router) | 全栈框架，支持 SSR/ISR/API Route |
| 样式 | Tailwind CSS | 原子化 CSS，快速开发 |
| 主题 | next-themes | 暗色/亮色模式切换 |
| RSS 解析 | rss-parser | 轻量 RSS/Atom 解析库 |
| 进程管理 | PM2 | ECS 上的 Node.js 进程守护 |
| 反向代理 | Nginx | HTTPS + 反向代理到 3200 端口 |

## 架构概览

```
用户浏览器
    ↓ HTTPS
nest.hlxcccc.asia (DNS)
    ↓
Nginx (443)
    ↓ proxy_pass localhost:3200
Next.js Server (PM2, port 3200)
    ↓ ISR revalidate: 86400 (每天)
lib/rss.ts → rss-parser
    ↓
RSS 源 (TechCrunch AI, 机器之心, ...)
```

## 项目结构

```
next-demo-collection/
├── app/
│   ├── layout.tsx              # 根布局 (ThemeProvider, 字体)
│   ├── page.tsx                # 首页 (Tab 容器)
│   ├── globals.css             # 全局样式
│   └── api/
│       ├── _shared/
│       │   ├── middleware.ts   # 共享中间件（错误处理、日志、CORS）
│       │   └── response.ts    # 统一响应格式工具
│       └── rss/
│           └── route.ts       # RSS 抓取接口（供调试/手动刷新用）
├── components/
│   ├── TabBar.tsx              # 顶部 Tab 切换栏
│   ├── ThemeToggle.tsx         # 暗/亮切换按钮
│   ├── ai-news/
│   │   ├── NewsHeadline.tsx   # 头条大卡片
│   │   ├── NewsListItem.tsx  # 列表条目
│   │   ├── NewsFeed.tsx       # 新闻聚合容器
│   │   └── NewsSkeleton.tsx  # 骨架屏加载态
│   └── ui/                    # 通用 UI 组件
├── lib/
│   ├── rss.ts                # RSS 解析逻辑
│   ├── rss-config.ts         # RSS 源配置
│   └── types.ts              # 类型定义
├── public/
├── tailwind.config.ts
├── next.config.ts
├── ecosystem.config.js       # PM2 配置
└── package.json
```

## 数据模型

```ts
interface NewsItem {
  id: string;          // 基于 URL 生成的唯一 hash
  title: string;       // 新闻标题
  summary: string;     // 摘要（截取 description 前 200 字）
  source: string;      // 来源名称（如 "TechCrunch"）
  sourceIcon?: string; // 来源 favicon
  url: string;         // 原文链接
  imageUrl?: string;   // 封面图（从 RSS enclosure 或 content 中提取）
  publishedAt: string; // 发布时间 ISO 格式
}
```

## RSS 源配置

集中管理在 `lib/rss-config.ts`，新增源只需修改此文件：

```ts
const RSS_SOURCES = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "机器之心",
    url: "https://www.jiqizhixin.com/rss",
  },
  // 后续可扩展更多源...
];
```

## RSS 数据获取策略

- **方式：** 页面使用 ISR（增量静态再生），`revalidate: 86400`（每天重新抓取）
- **解析流程：** `rss-parser` 并行抓取所有 RSS 源 → 解析提取字段 → 合并去重 → 按发布时间倒序排列
- **容错：** 单个源失败静默跳过，不影响其他源展示；全部失败时显示"暂无新闻"占位 + 重试按钮
- **图片提取：** 优先从 RSS `enclosure` 字段获取，其次从 `content` HTML 中提取第一个 `<img>` 标签

## UI 设计

### 主题

- 默认暗色模式（Dark Mode）
- 提供手动切换至亮色模式的按钮（右上角）
- 使用 `next-themes` 管理主题状态，偏好存储于 `localStorage`

### 页面布局

```
┌─────────────────────────────────────────────┐
│  Logo    [AI 新闻] [Tab 2] [Tab 3]  🌙/☀️   │  ← TabBar + ThemeToggle
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  头条大卡片 (NewsHeadline)           │    │  ← 最新一条新闻，突出展示
│  │  封面图 + 标题 + 摘要 + 来源 + 时间  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────┐ ┌──────────────────────────┐     │
│  │ icon │ │ 标题                来源  │     │  ← NewsListItem × N
│  ├──────┤ ├──────────────────────────┤     │
│  │ icon │ │ 标题                来源  │     │
│  ├──────┤ ├──────────────────────────┤     │
│  │ icon │ │ 标题                来源  │     │
│  └──────┘ └──────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

### Tab 切换机制

- Tab 列表从配置数组读取，支持动态扩展
- 使用 React state 控制当前激活的 Tab，纯客户端切换
- 目前仅有 "AI 新闻" 一个 Tab，预留后续 demo 扩展位

### 新闻卡片

- **NewsHeadline（头条）：** 展示最新一条新闻，大卡片样式，包含封面图、标题、完整摘要、来源标签和时间
- **NewsListItem（列表项）：** 紧凑布局，左侧来源图标 + 右侧标题、摘要截断、来源和时间
- **NewsSkeleton（骨架屏）：** 加载态占位，与真实卡片结构一致

### 错误处理

| 场景 | 处理方式 |
|------|---------|
| 全部 RSS 源失败 | 显示"暂无新闻"占位 + 重试按钮 |
| 部分源失败 | 静默跳过，仅展示成功源 |
| 加载态 | 骨架屏占位 |

## API 架构

为后续接口开发预留统一的 API 共享层：

```
app/api/
├── _shared/
│   ├── middleware.ts   # 错误捕获、请求日志、CORS
│   └── response.ts    # 统一响应格式
└── rss/
    └── route.ts       # RSS 调试接口
```

### 统一响应格式

```ts
// 成功
{
  code: 200,
  message: "success",
  data: { ... }
}

// 失败
{
  code: 500,
  message: "错误描述",
  data: null
}
```

### 工具函数

```ts
// lib/api/response.ts
function success(data: unknown, message?: string): NextResponse;
function error(message: string, code?: number): NextResponse;
```

## 部署方案

### 服务器环境

- 阿里云 ECS
- Node.js 18+
- Nginx（反向代理 + HTTPS）
- PM2（进程管理）

### 端口配置

- Next.js 运行端口：**3200**
- Nginx 监听端口：443 (HTTPS) / 80 (HTTP → 301 → HTTPS)
- Nginx `proxy_pass` 指向 `localhost:3200`

### Nginx 配置要点

```nginx
server {
    listen 443 ssl;
    server_name nest.hlxcccc.asia;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name nest.hlxcccc.asia;
    return 301 https://$host$request_uri;
}
```

### PM2 配置

```js
// ecosystem.config.js
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

### 部署流程

1. `git pull` 拉取最新代码
2. `npm install && npm run build`
3. `pm2 restart next-demo`（或首次 `pm2 start ecosystem.config.js`）
4. Nginx 配置 HTTPS 证书 + 反向代理
