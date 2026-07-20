const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openrouter/free";
const MAX_OUTPUT_TOKENS = 4096;
const MAX_ARTICLE_CHARS = 8000;type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function chatCompletion(
  messages: ChatMessage[],
  model = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY не задан. Добавьте ключ в .env.local и перезапустите сервер.",
    );
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Referent",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: MAX_OUTPUT_TOKENS,
    }),    signal: AbortSignal.timeout(120000),
  });

  const data = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    const apiMessage = data.error?.message ?? `OpenRouter вернул ошибку (${response.status})`;

    if (/credits|afford|max_tokens/i.test(apiMessage)) {
      throw new Error(
        "Недостаточно кредитов OpenRouter для этой модели. Сейчас используется бесплатная модель openrouter/free — перезапустите сервер и попробуйте снова.",
      );
    }

    throw new Error(apiMessage);
  }
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter не вернул текст ответа");
  }

  return content;
}

export async function translateArticleToRussian(
  title: string | null,
  content: string | null,
): Promise<string> {
  if (!content?.trim()) {
    throw new Error("Не удалось получить текст статьи для перевода");
  }

  const articleText = [
    title ? `Заголовок: ${title}` : null,
    "",
    content.slice(0, MAX_ARTICLE_CHARS),  ]
    .filter((part) => part !== null)
    .join("\n");

  return chatCompletion([
    {
      role: "system",
      content:
        "Ты профессиональный переводчик. Переводи англоязычные статьи на русский язык точно и естественно. Сохраняй структуру: сначала перевод заголовка, затем основной текст. Не добавляй комментариев от себя.",
    },
    {
      role: "user",
      content: `Переведи эту статью на русский язык:\n\n${articleText}`,
    },
  ]);
}
