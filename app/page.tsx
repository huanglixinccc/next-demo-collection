import { fetchAllNews } from "@/lib/rss";
import { TabConfig } from "@/lib/types";
import { Header } from "@/components/Header";
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
      <Header tabs={TABS} />

      {/* 内容区 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <NewsFeed news={news} />
      </main>
    </div>
  );
}
