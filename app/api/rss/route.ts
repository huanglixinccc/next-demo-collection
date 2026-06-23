import { NextRequest } from "next/server";
import { fetchAllNews } from "@/lib/rss";
import { success, error } from "../_shared/response";
import { withCors, logRequest, handleOptions } from "../_shared/middleware";

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

export async function OPTIONS() {
  return handleOptions();
}
