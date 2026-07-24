import type { ErrorCode } from "@/lib/errors";

export const USER_ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_URL:
    "Проверьте ссылку: адрес должен начинаться с http:// или https://.",
  VALIDATION: "Не удалось выполнить запрос. Проверьте введённые данные.",
  ARTICLE_FETCH_FAILED: "Не удалось загрузить статью по этой ссылке.",
  ARTICLE_PARSE_FAILED:
    "Статья загружена, но не удалось извлечь текст. Попробуйте другую ссылку.",
  AI_UNAVAILABLE:
    "Сервис AI временно недоступен. Попробуйте ещё раз через минуту.",
  AI_CREDITS:
    "Недостаточно лимита OpenRouter. Проверьте ключ или выберите бесплатную модель.",
  UNKNOWN: "Что-то пошло не так. Попробуйте ещё раз позже.",
};

export function getUserErrorMessage(code: ErrorCode | undefined): string {
  if (!code || !(code in USER_ERROR_MESSAGES)) {
    return USER_ERROR_MESSAGES.UNKNOWN;
  }

  return USER_ERROR_MESSAGES[code];
}

export function parseErrorCode(value: unknown): ErrorCode | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (value in USER_ERROR_MESSAGES) {
    return value as ErrorCode;
  }

  return undefined;
}
