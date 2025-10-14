import fetch from 'node-fetch';

// OpenRouter Chat Completions endpoint (OpenAI-compatible)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helpers
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export class RateLimitError extends Error {
  constructor(message, retryAfterSeconds = null) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.isRateLimit = true;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callOpenRouterWithRetry = async (payload, { maxRetries = 3, baseDelayMs = 800 } = {}) => {
  let attempt = 0;
  while (true) {
    attempt += 1;
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || ''}`,
        // Optional but recommended by OpenRouter
        ...(process.env.OPENROUTER_REFERER ? { 'HTTP-Referer': process.env.OPENROUTER_REFERER } : {}),
        ...(process.env.OPENROUTER_TITLE ? { 'X-Title': process.env.OPENROUTER_TITLE } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) return res.json();

    const status = res.status;
    const retryAfterHeader = res.headers?.get?.('retry-after');
    const retryAfterSeconds = retryAfterHeader ? toInt(retryAfterHeader, null) : null;

    if (status === 429 || (status >= 500 && status < 600)) {
      if (attempt > maxRetries) {
        if (status === 429) throw new RateLimitError('OpenRouter error: Too Many Requests', retryAfterSeconds);
        throw new Error(`OpenRouter error: ${status} after ${maxRetries} retries`);
      }
      const backoffMs = retryAfterSeconds
        ? retryAfterSeconds * 1000
        : Math.min(6000, baseDelayMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      // eslint-disable-next-line no-console
      console.warn(`OpenRouter request failed with ${status}. Retrying in ${Math.round(backoffMs)}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(backoffMs);
      continue;
    }

    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText} ${text && `- ${text}`}`);
  }
};

export const generateReport = async (stockData) => {
  // Single vs multi-stock prompt shaping (same behavior as before)
  const isMultiStock = Array.isArray(stockData) && stockData.some((item) => item.ticker);

  let prompt;
  if (isMultiStock) {
    const stockSummaries = stockData
      .map((stock) => {
        if (stock.error) return `${stock.name} (${stock.ticker}): error - ${stock.error}`;
        if (stock.data && stock.data.length > 0) {
          const d = stock.data[0];
          return `${stock.name} (${stock.ticker}) => close:${d.c} open:${d.o} high:${d.h} low:${d.l} vol:${d.v}`;
        }
        return `${stock.name} (${stock.ticker}): no recent data`;
      })
      .join('\n');

    prompt = `Generate a comparative financial analysis for the following stocks. Use clear sections and bullet points, highlight trends, momentum, valuation signals if any, and an overall recommendation with risks.\n\n${stockSummaries}`;
  } else {
    prompt = `Generate a concise financial report based on the following stock data: ${JSON.stringify(stockData)}`;
  }

  const model = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'openrouter/auto';
  const maxRetries = toInt(process.env.OPENROUTER_MAX_RETRIES || process.env.OPENAI_MAX_RETRIES, 3);
  const maxTokens = toInt(process.env.OPENROUTER_MAX_TOKENS || process.env.OPENAI_MAX_TOKENS, 800);

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional financial analyst. Be concise, structured, and actionable. Avoid filler and disclaimers. Use short paragraphs and bullets.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  const data = await callOpenRouterWithRetry(payload, { maxRetries });
  return data.choices?.[0]?.message?.content || '';
};