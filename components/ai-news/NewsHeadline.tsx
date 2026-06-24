/**
 * 新闻头条大卡片组件
 * 突出展示最新一条新闻，包含封面图、标题、摘要、来源标签和时间
 */
import { NewsItem } from "@/lib/types";

interface NewsHeadlineProps {
  item: NewsItem;
}

/** 将 ISO 时间格式化为相对时间（刚刚/X小时前/X天前/日期） */
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

/** 头条卡片，点击在新窗口打开原文 */
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
