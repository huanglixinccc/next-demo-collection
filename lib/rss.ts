/**
 * RSS 解析核心逻辑
 * 负责从多个 RSS 源并行抓取新闻，解析、去重、排序后返回统一格式
 */
import Parser from "rss-parser";
import { createHash } from "crypto";
import { NewsItem } from "./types";
import { RSS_SOURCES } from "./rss-config";

/** RSS 解析器实例，设置超时和 UA */
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NextDemoCollection/1.0",
  },
});

/** 根据 URL 生成唯一的新闻 ID（MD5 截取前 12 位） */
function generateId(url: string): string {
  return createHash("md5").update(url).digest("hex").slice(0, 12);
}

/** 从 HTML 内容中提取第一张图片的 URL */
function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1];
}

/** 清除 HTML 标签并截断文本到指定长度 */
function truncateText(text: string, maxLength: number): string {
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + "..." : cleaned;
}

/**
 * 抓取单个 RSS 源的新闻
 * 失败时静默返回空数组，不影响其他源
 */
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

/**
 * 聚合所有 RSS 源的新闻
 * 并行抓取 → 合并 → 去重 → 按发布时间倒序排列
 */
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
