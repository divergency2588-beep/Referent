import { NextResponse } from "next/server";
import { translateArticleToRussian } from "@/lib/openrouter";
import { parseArticleFromUrl } from "@/lib/parseArticle";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL статьи обязателен" },
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
    const result = await translateArticleToRussian(
      article.title,
      article.content,
    );

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
