import { NextResponse } from "next/server";
import { parseArticleFromUrl } from "@/lib/parseArticle";

type ActionType = "summary" | "theses" | "telegram";

const PLACEHOLDER: Record<ActionType, (title: string | null) => string> = {
  summary: (title) =>
    `Краткое описание статьи «${title ?? "без заголовка"}» появится здесь после подключения AI.`,
  theses: (title) =>
    `• Тезис 1\n• Тезис 2\n• Тезис 3\n\nТезисы для «${title ?? "статьи"}» появятся после подключения AI.`,
  telegram: (title) =>
    `📰 ${title ?? "Заголовок поста"}\n\nКраткий анонс статьи на русском языке.\n\n🔗 Ссылка на источник`,
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

    if (!action || !["summary", "theses", "telegram"].includes(action)) {
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

    const article = await parseArticleFromUrl(url);

    return NextResponse.json({
      action,
      result: PLACEHOLDER[action](article.title),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
