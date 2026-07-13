import { NextResponse } from "next/server";
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

    const parsed = {
      date: article.date,
      title: article.title,
      content: article.content,
    };

    return NextResponse.json({
      ...parsed,
      result: JSON.stringify(parsed, null, 2),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
