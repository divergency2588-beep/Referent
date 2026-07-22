export type AnalyzeAction = "summary" | "theses" | "telegram";

type PromptPair = {
  system: string;
  buildUser: (articleText: string, url?: string) => string;
};

export const ANALYZE_PROMPTS: Record<AnalyzeAction, PromptPair> = {
  summary: {
    system:
      "Ты редактор, который кратко объясняет англоязычные статьи на русском языке. Отвечай только по существу, без вступлений и комментариев от себя.",
    buildUser: (articleText) =>
      `Прочитай англоязычную статью ниже и напиши на русском языке краткое описание из 2–4 предложений: о чём статья и какая главная мысль.\n\n${articleText}`,
  },
  theses: {
    system:
      "Ты аналитик, который выделяет ключевые идеи из англоязычных статей. Отвечай на русском языке, только списком тезисов, без пояснений от себя.",
    buildUser: (articleText) =>
      `Прочитай англоязычную статью ниже и составь на русском языке маркированный список из 5–10 ключевых тезисов. Каждый тезис начинай с «•».\n\n${articleText}`,
  },
  telegram: {
    system:
      "Ты SMM-редактор, который пишет короткие посты для Telegram на русском языке по англоязычным статьям. Пиши живо, но без воды. Не добавляй ссылку на источник — она будет добавлена автоматически. Не добавляй комментариев от себя.",
    buildUser: (articleText) =>
      `Прочитай англоязычную статью ниже и напиши готовый пост для Telegram на русском языке.\n\nТребования:\n- короткий цепляющий заголовок\n- 1–2 абзаца анонса\n- можно использовать 1–2 уместных эмодзи\n- без ссылки на источник в конце\n\n${articleText}`,
  },
};

export function buildArticleText(
  title: string | null,
  content: string,
  maxChars: number,
): string {
  const parts = [
    title ? `Заголовок: ${title}` : null,
    "",
    content.slice(0, maxChars),
  ].filter((part) => part !== null);

  return parts.join("\n");
}
