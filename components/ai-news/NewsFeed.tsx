/**
 * 新闻聚合容器组件
 * 将第一条新闻用头条卡片展示，其余用列表条目展示
 * 无数据时显示空状态提示
 */
import { NewsItem } from "@/lib/types";
import { NewsHeadline } from "./NewsHeadline";
import { NewsListItem } from "./NewsListItem";

interface NewsFeedProps {
  news: NewsItem[];
}

/** @param news - 已排序的新闻列表（最新在前） */
export function NewsFeed({ news }: NewsFeedProps) {
  // 无数据时显示空状态
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

  // 第一条为头条，其余为列表
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
