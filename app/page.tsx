/**
 * 首页
 * Tab 容器 + AI 新闻数据获取，使用 ISR 每天重新验证
 */
import { fetchAllNews } from "@/lib/rss";
import { TabConfig } from "@/lib/types";
import { Header } from "@/components/Header";
import { NewsFeed } from "@/components/ai-news/NewsFeed";

export const revalidate = 86400; // ISR: 每天重新验证

/** Tab 配置列表，新增 Tab 在此添加 */
const TABS: TabConfig[] = [
  { id: "ai-news", label: "AI 新闻" },
  // 后续在这里添加更多 Tab
];

/** 首页组件，服务端获取新闻数据后渲染 */
export default async function Home() {
  const news = await fetchAllNews();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Header tabs={TABS} />

      {/* 内容区 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <NewsFeed news={news} />
      </main>
    </div>
  );
}
