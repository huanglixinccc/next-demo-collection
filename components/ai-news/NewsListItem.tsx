/**
 * 新闻列表条目组件
 * 紧凑布局，左侧来源图标 + 右侧标题、摘要截断、来源和时间
 */
import { NewsItem } from "@/lib/types";

interface NewsListItemProps {
  item: NewsItem;
}

/** 将 ISO 时间格式化为简短相对时间（刚刚/Xh/Xd/日期） */
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

/** 列表条目，点击在新窗口打开原文 */
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
