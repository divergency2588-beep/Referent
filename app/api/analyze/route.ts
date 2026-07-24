import { NextResponse } from "next/server";
import { assertValidHttpUrl, errorResponse } from "@/lib/apiError";
import { AppError } from "@/lib/errors";
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
      throw new AppError("VALIDATION", 400);
    }

    if (!action || !["summary", "theses", "telegram"].includes(action)) {
      throw new AppError("VALIDATION", 400);
    }

    assertValidHttpUrl(url);

    const article = await parseArticleFromUrl(url);
    const result = await ANALYZERS[action](
      article.title,
      article.content,
      url,
    );

    return NextResponse.json({ action, result });
  } catch (error) {
    return errorResponse(error);
  }
}
