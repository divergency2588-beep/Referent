export type ErrorCode =
  | "INVALID_URL"
  | "VALIDATION"
  | "ARTICLE_FETCH_FAILED"
  | "ARTICLE_PARSE_FAILED"
  | "AI_UNAVAILABLE"
  | "AI_CREDITS"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, status = 500) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
