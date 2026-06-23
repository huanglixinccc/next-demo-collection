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
