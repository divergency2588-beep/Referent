"use client";

import { useState } from "react";

type ActionType = "summary" | "theses" | "telegram";

const ACTION_LABELS: Record<ActionType, string> = {
  summary: "О чём статья?",
  theses: "Тезисы",
  telegram: "Пост для Telegram",
};

const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  summary: "Краткое описание содержания статьи",
  theses: "Основные тезисы и ключевые идеи",
  telegram: "Готовый пост для публикации в Telegram",
};

const ACTION_STYLES: Record<
  ActionType,
  { button: string; badge: string; spinner: string }
> = {
  summary: {
    button: "bg-blue-600 hover:bg-blue-700",
    badge: "bg-blue-100 text-blue-700",
    spinner: "border-t-blue-600",
  },
  theses: {
    button: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    spinner: "border-t-emerald-600",
  },
  telegram: {
    button: "bg-violet-600 hover:bg-violet-700",
    badge: "bg-violet-100 text-violet-700",
    spinner: "border-t-violet-600",
  },
};

const LOADING_LABELS: Record<ActionType, string> = {
  summary: "Генерация ответа…",
  theses: "Генерация ответа…",
  telegram: "Генерация ответа…",
};

const ACTION_ORDER: ActionType[] = ["summary", "theses", "telegram"];

export default function ArticleForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAction = async (action: ActionType) => {
    if (!isValidUrl(url)) {
      setError("Введите корректный URL статьи (http:// или https://)");
      return;
    }

    setError("");
    setActiveAction(action);
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Не удалось обработать статью");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Referent
        </h1>
        <p className="text-slate-600">
          Вставьте ссылку на англоязычную статью и выберите нужное действие
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label
            htmlFor="article-url"
            className="block text-sm font-medium text-slate-700"
          >
            URL англоязычной статьи
          </label>
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {ACTION_ORDER.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleAction(action)}
              disabled={loading}
              title={ACTION_DESCRIPTIONS[action]}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${ACTION_STYLES[action].button}`}
            >
              {ACTION_LABELS[action]}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Результат</h2>
          {activeAction && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${ACTION_STYLES[activeAction].badge}`}
            >
              {ACTION_LABELS[activeAction]}
            </span>
          )}
        </div>

        <div className="min-h-48 rounded-xl border border-slate-200 bg-white p-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center gap-3 text-slate-500">
              <span
                className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-300 ${activeAction ? ACTION_STYLES[activeAction].spinner : "border-t-blue-600"}`}
              />
              <span>
                {activeAction ? LOADING_LABELS[activeAction] : "Загрузка…"}
              </span>
            </div>
          ) : result ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {result}
            </p>
          ) : (
            <p className="text-slate-400">
              Здесь появится результат после выбора действия
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
