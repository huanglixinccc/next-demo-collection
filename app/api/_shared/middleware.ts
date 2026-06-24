/**
 * API 共享中间件
 * 提供 CORS、请求日志、OPTIONS 预检等通用处理逻辑
 */
import { NextRequest } from "next/server";

/** 为响应添加 CORS 头 */
export function withCors(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

/** 记录请求日志（方法 + 路径 + 时间） */
export function logRequest(request: NextRequest): void {
  const { method, nextUrl } = request;
  console.log(`[API] ${method} ${nextUrl.pathname} - ${new Date().toISOString()}`);
}

/** 处理 CORS 预检请求（OPTIONS） */
export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
