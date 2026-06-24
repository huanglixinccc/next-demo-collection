/**
 * API 统一响应工具
 * 提供 success/error 函数，确保所有 API 返回统一的 { code, message, data } 格式
 */
import { NextResponse } from "next/server";

/** 统一响应结构 */
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

/** 返回成功响应 */
export function success<T>(data: T, message = "success"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: 200,
    message,
    data,
  });
}

/** 返回错误响应 */
export function error(message: string, code = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code,
      message,
      data: null,
    },
    { status: code }
  );
}
