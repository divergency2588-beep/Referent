import { NextResponse } from "next/server";

type ActionType = "summary" | "theses" | "telegram";

const PLACEHOLDER: Record<ActionType, string> = {
  summary:
    "Здесь будет краткое описание статьи. Подключение парсера и AI — на следующем этапе.",
  theses:
    "• Тезис 1\n• Тезис 2\n• Тезис 3\n\nСписок тезисов появится после интеграции с AI.",
  telegram:
    "📰 Заголовок поста\n\nКраткий анонс статьи на русском языке.\n\n🔗 Ссылка на источник",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, action } = body as { url?: string; action?: ActionType };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL статьи обязателен" },
        { status: 400 },
      );
    }

    if (!action || !(action in PLACEHOLDER)) {
      return NextResponse.json(
        { error: "Неизвестный тип действия" },
        { status: 400 },
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Некорректный URL" },
        { status: 400 },
      );
    }

    // Заглушка до подключения парсера и AI
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      result: `${PLACEHOLDER[action]}\n\nИсточник: ${url}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
