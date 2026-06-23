export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceIcon?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface RssSource {
  name: string;
  url: string;
}

export interface TabConfig {
  id: string;
  label: string;
}
