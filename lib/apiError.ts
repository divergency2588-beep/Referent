import { NextResponse } from "next/server";
import { AppError, isAppError, type ErrorCode } from "@/lib/errors";

export function errorResponse(error: unknown): NextResponse<{ code: ErrorCode }> {
  if (isAppError(error)) {
    return NextResponse.json({ code: error.code }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ code: "UNKNOWN" }, { status: 500 });
}

export function assertValidHttpUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new AppError("INVALID_URL", 400);
    }
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }
    throw new AppError("INVALID_URL", 400);
  }
}
