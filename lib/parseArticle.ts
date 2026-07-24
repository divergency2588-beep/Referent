import * as cheerio from "cheerio";
import { AppError } from "@/lib/errors";

export type ParsedArticle = {
  date: string | null;
  title: string | null;
  content: string | null;
};

const CONTENT_SELECTORS = [
  "article",
  '[role="main"]',
  "main",
  ".post-content",
  ".article-content",
  ".entry-content",
  ".article-body",
  ".story-body",
  ".content",
  ".post",
  "#content",
];

const DATE_SELECTORS = [
  "time[datetime]",
  'meta[property="article:published_time"]',
  'meta[name="publish-date"]',
  'meta[name="date"]',
  'meta[itemprop="datePublished"]',
  '[itemprop="datePublished"]',
  ".published",
  ".post-date",
  ".entry-date",
  ".date",
];

const NOISE_SELECTORS =
  "script, style, nav, header, footer, aside, noscript, iframe, form, .sidebar, .comments, .advertisement, .ad";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractMetaContent(
  $: cheerio.CheerioAPI,
  selector: string,
): string | null {
  const value = $(selector).attr("content")?.trim();
  return value || null;
}

function extractTitle($: cheerio.CheerioAPI): string | null {
  const candidates = [
    extractMetaContent($, 'meta[property="og:title"]'),
    extractMetaContent($, 'meta[name="twitter:title"]'),
    normalizeText($("article h1").first().text()),
    normalizeText($("main h1").first().text()),
    normalizeText($("h1").first().text()),
    normalizeText($("title").first().text()),
  ];

  return candidates.find((value) => value && value.length > 0) ?? null;
}

function extractDate($: cheerio.CheerioAPI): string | null {
  for (const selector of DATE_SELECTORS) {
    const element = $(selector).first();

    if (!element.length) {
      continue;
    }

    const datetime =
      element.attr("datetime") ??
      element.attr("content") ??
      element.attr("value");

    if (datetime?.trim()) {
      return datetime.trim();
    }

    const text = normalizeText(element.text());
    if (text.length > 0) {
      return text;
    }
  }

  return null;
}

function extractContent($: cheerio.CheerioAPI): string | null {
  let bestContent: string | null = null;
  let bestLength = 0;

  for (const selector of CONTENT_SELECTORS) {
    const element = $(selector).first();
    if (!element.length) {
      continue;
    }

    const clone = element.clone();
    clone.find(NOISE_SELECTORS).remove();

    const text = normalizeText(clone.text());
    if (text.length > bestLength) {
      bestLength = text.length;
      bestContent = text;
    }
  }

  if (bestContent) {
    return bestContent;
  }

  $("body").find(NOISE_SELECTORS).remove();
  const fallback = normalizeText($("body").text());
  return fallback.length > 0 ? fallback : null;
}

export function parseArticleHtml(html: string): ParsedArticle {
  const $ = cheerio.load(html);

  return {
    date: extractDate($),
    title: extractTitle($),
    content: extractContent($),
  };
}

export async function fetchArticleHtml(url: string): Promise<string> {
  const parsedUrl = new URL(url);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: `${parsedUrl.protocol}//${parsedUrl.hostname}/`,
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new AppError("ARTICLE_FETCH_FAILED", 502);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new AppError("ARTICLE_FETCH_FAILED", 502);
    }

    return response.text();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("ARTICLE_FETCH_FAILED", 502);
  }
}

export async function parseArticleFromUrl(url: string): Promise<ParsedArticle> {
  const html = await fetchArticleHtml(url);
  const parsed = parseArticleHtml(html);

  if (!parsed.title && !parsed.content) {
    throw new AppError("ARTICLE_PARSE_FAILED", 422);
  }

  return parsed;
}
