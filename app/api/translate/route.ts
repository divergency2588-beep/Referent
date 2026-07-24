import { NextResponse } from "next/server";
import { assertValidHttpUrl, errorResponse } from "@/lib/apiError";
import { AppError } from "@/lib/errors";
import { translateArticleToRussian } from "@/lib/openrouter";
import { parseArticleFromUrl } from "@/lib/parseArticle";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      throw new AppError("VALIDATION", 400);
    }

    assertValidHttpUrl(url);

    const article = await parseArticleFromUrl(url);
    const result = await translateArticleToRussian(
      article.title,
      article.content,
    );

    return NextResponse.json({ result });
  } catch (error) {
    return errorResponse(error);
  }
}
