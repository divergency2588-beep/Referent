import { NextResponse } from "next/server";
import { assertValidHttpUrl, errorResponse } from "@/lib/apiError";
import { AppError } from "@/lib/errors";
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
    return errorResponse(error);
  }
}
