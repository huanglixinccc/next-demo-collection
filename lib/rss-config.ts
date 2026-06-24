/**
 * RSS 源配置
 * 集中管理所有 RSS 订阅源，新增/删除源只需修改此文件
 */
import { RssSource } from "./types";

export const RSS_SOURCES: RssSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "36氪",
    url: "https://36kr.com/feed",
  },
  {
    name: "IT之家",
    url: "https://www.ithome.com/rss/",
  },
];
