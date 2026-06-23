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
