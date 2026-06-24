/**
 * 全局类型定义
 * 项目中所有共享的 TypeScript 接口和类型声明
 */

/** 新闻条目，由 RSS 解析后生成 */
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

/** RSS 订阅源配置 */
export interface RssSource {
  name: string;
  url: string;
}

/** 顶部 Tab 标签页配置 */
export interface TabConfig {
  id: string;
  label: string;
}
