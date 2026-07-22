import { NextResponse } from "next/server";
import {
  extractTheses,
  generateTelegramPost,
  summarizeArticle,
} from "@/lib/openrouter";
import { parseArticleFromUrl } from "@/lib/parseArticle";

type ActionType = "summary" | "theses" | "telegram";

const ANALYZERS: Record<
  ActionType,
  (
    title: string | null,
    content: string | null,
    url: string,
  ) => Promise<string>
> = {
  summary: (title, content) => summarizeArticle(title, content),
  theses: (title, content) => extractTheses(title, content),
  telegram: (title, content, url) => generateTelegramPost(title, content, url),
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
    const result = await ANALYZERS[action](
      article.title,
      article.content,
      url,
    );

    return NextResponse.json({ action, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
