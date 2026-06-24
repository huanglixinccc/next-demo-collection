# Nest - Next.js Demo Collection

## 项目概述

个人 Demo 集合平台，采用顶部 Tab 标签页组织不同的 demo 和小功能。部署在阿里云 ECS，域名 `nest.hlxcccc.asia`。

## 技术栈

- **框架:** Next.js 16 (App Router) + TypeScript
- **样式:** Tailwind CSS v4
- **主题:** next-themes（默认暗色 + 手动切换亮色）
- **RSS:** rss-parser
- **Node.js:** >= 20.9.0（.nvmrc 锁定 v20）
- **部署:** PM2 + Nginx 反向代理（端口 3200）

## 项目结构

```
├── app/                          # Next.js App Router 页面与 API
│   ├── layout.tsx                # 根布局（字体、ThemeProvider 包裹）
│   ├── page.tsx                  # 首页（Tab 容器 + 数据获取）
│   ├── globals.css               # 全局样式 + Tailwind 配置
│   └── api/
│       ├── _shared/              # API 共享层（所有接口复用）
│       │   ├── middleware.ts     # CORS、请求日志、OPTIONS 处理
│       │   └── response.ts      # 统一响应格式 success()/error()
│       └── rss/
│           └── route.ts          # RSS 新闻接口（GET）
├── components/                   # React 组件
│   ├── Header.tsx                # 顶部栏（Logo + TabBar + ThemeToggle）
│   ├── TabBar.tsx                # Tab 标签切换栏
│   ├── ThemeProvider.tsx         # next-themes 客户端包裹
│   ├── ThemeToggle.tsx           # 暗色/亮色切换按钮
│   └── ai-news/                  # AI 新闻 Tab 专用组件
│       ├── NewsFeed.tsx          # 新闻聚合容器（头条 + 列表）
│       ├── NewsHeadline.tsx      # 头条大卡片
│       ├── NewsListItem.tsx      # 列表条目
│       └── NewsSkeleton.tsx      # 骨架屏加载态
├── lib/                          # 业务逻辑与工具函数
│   ├── types.ts                  # 全局类型定义
│   ├── rss-config.ts             # RSS 源配置（增删源改这里）
│   └── rss.ts                    # RSS 解析核心逻辑
├── public/                       # 静态资源
├── ecosystem.config.js           # PM2 进程配置
└── .nvmrc                        # Node.js 版本锁定
```

## 新增 Tab 的步骤

1. 在 `components/` 下创建新 Tab 的组件目录
2. 在 `app/page.tsx` 的 `TABS` 数组中添加新 Tab 配置
3. 根据 `activeTab` 条件渲染对应组件

## 新增 API 的步骤

1. 在 `app/api/` 下创建新的路由目录和 `route.ts`
2. 导入 `app/api/_shared/response.ts` 的 `success`/`error` 函数
3. 导入 `app/api/_shared/middleware.ts` 的 `withCors`/`logRequest` 函数
4. 保持统一响应格式：`{ code, message, data }`

## Commit 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能/新需求 | `feat: add AI news tab with RSS aggregation` |
| `fix` | 修复 Bug | `fix: correct RSS parsing error for 36kr` |
| `refactor` | 代码重构（不改变功能） | `refactor: extract formatTime to shared util` |
| `style` | 代码格式/样式调整 | `style: format with prettier` |
| `docs` | 文档更新 | `docs: update AGENTS.md with new structure` |
| `chore` | 构建/工具/依赖变更 | `chore: upgrade Next.js to v16` |
| `perf` | 性能优化 | `perf: add ISR caching for RSS feeds` |
| `test` | 测试相关 | `test: add unit tests for RSS parser` |

格式：`<type>: <简短描述>`

## 代码注释规范

- 所有 `.ts`/`.tsx` 文件顶部加文件级注释，说明文件职责
- 函数/组件上方加 JSDoc 注释，说明功能和参数
- 复杂逻辑处加行内注释说明意图
