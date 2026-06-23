import { NextResponse } from "next/server";

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export function success<T>(data: T, message = "success"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: 200,
    message,
    data,
  });
}

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
