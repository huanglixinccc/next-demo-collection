/**
 * RSS 新闻 API 路由
 * GET /api/rss - 返回所有 RSS 源聚合的新闻列表
 */
import { NextRequest } from "next/server";
import { fetchAllNews } from "@/lib/rss";
import { success, error } from "../_shared/response";
import { withCors, logRequest, handleOptions } from "../_shared/middleware";

/** 获取所有新闻，返回统一格式响应 */
export async function GET(request: NextRequest) {
  logRequest(request);

  try {
    const news = await fetchAllNews();
    const response = success(news, `共 ${news.length} 条新闻`);
    return withCors(response);
  } catch (err) {
    const response = error("获取新闻失败，请稍后重试", 500);
    return withCors(response);
  }
}

/** 处理 CORS 预检请求 */
export async function OPTIONS() {
  return handleOptions();
}
