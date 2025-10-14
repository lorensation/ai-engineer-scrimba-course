import fetch from 'node-fetch';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Utility helpers
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export class OpenAIRateLimitError extends Error {
  constructor(message, retryAfterSeconds = null) {
    super(message);
    this.name = 'OpenAIRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.isRateLimit = true;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callOpenAIWithRetry = async (payload, { maxRetries = 3, baseDelayMs = 800 } = {}) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) return res.json();

    const status = res.status;
    const retryAfterHeader = res.headers?.get?.('retry-after');
    const retryAfterSeconds = retryAfterHeader ? toInt(retryAfterHeader, null) : null;

    if (status === 429 || (status >= 500 && status < 600)) {
      if (attempt > maxRetries) {
        if (status === 429) throw new OpenAIRateLimitError('OpenAI API error: Too Many Requests', retryAfterSeconds);
        throw new Error(`OpenAI API error: ${status} after ${maxRetries} retries`);
      }
      const backoffMs = retryAfterSeconds
        ? retryAfterSeconds * 1000
        : Math.min(5000, baseDelayMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      // eslint-disable-next-line no-console
      console.warn(`OpenAI request failed with ${status}. Retrying in ${Math.round(backoffMs)}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(backoffMs);
      continue;
    }

    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} ${text && `- ${text}`}`);
  }
};

export const generateReport = async (stockData) => {
  try {
    // Determine if this is single stock data or multi-stock data
    const isMultiStock = Array.isArray(stockData) && stockData.some((item) => item.ticker);

    let prompt;
    if (isMultiStock) {
      // Condense data to reduce tokens
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

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const maxRetries = toInt(process.env.OPENAI_MAX_RETRIES, 3);
    const maxTokens = toInt(process.env.OPENAI_MAX_TOKENS, 800);

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

    const data = await callOpenAIWithRetry(payload, { maxRetries });
    return data.choices[0].message.content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating report:', error);
    throw error;
  }
};
import fetch from 'node-fetch';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Utility helpers
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export class OpenAIRateLimitError extends Error {
  constructor(message, retryAfterSeconds = null) {
    super(message);
    this.name = 'OpenAIRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.isRateLimit = true;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callOpenAIWithRetry = async (payload, { maxRetries = 3, baseDelayMs = 800 } = {}) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) return res.json();

    const status = res.status;
    const retryAfterHeader = res.headers?.get?.('retry-after');
    const retryAfterSeconds = retryAfterHeader ? toInt(retryAfterHeader, null) : null;

    if (status === 429 || (status >= 500 && status < 600)) {
      if (attempt > maxRetries) {
        if (status === 429) throw new OpenAIRateLimitError('OpenAI API error: Too Many Requests', retryAfterSeconds);
        throw new Error(`OpenAI API error: ${status} after ${maxRetries} retries`);
      }
      const backoffMs = retryAfterSeconds
        ? retryAfterSeconds * 1000
        : Math.min(5000, baseDelayMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      // eslint-disable-next-line no-console
      console.warn(`OpenAI request failed with ${status}. Retrying in ${Math.round(backoffMs)}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(backoffMs);
      continue;
    }

    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} ${text && `- ${text}`}`);
  }
};

export const generateReport = async (stockData) => {
  try {
    // Determine if this is single stock data or multi-stock data
    const isMultiStock = Array.isArray(stockData) && stockData.some((item) => item.ticker);

    let prompt;
    if (isMultiStock) {
      // Condense data to reduce tokens
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

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const maxRetries = toInt(process.env.OPENAI_MAX_RETRIES, 3);
    const maxTokens = toInt(process.env.OPENAI_MAX_TOKENS, 800);

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

    const data = await callOpenAIWithRetry(payload, { maxRetries });
    return data.choices[0].message.content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating report:', error);
    throw error;
  }
};
import fetch from 'node-fetch';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Utility helpers
const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

export class OpenAIRateLimitError extends Error {
  constructor(message, retryAfterSeconds = null) {
    super(message);
    this.name = 'OpenAIRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.isRateLimit = true;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callOpenAIWithRetry = async (payload, { maxRetries = 3, baseDelayMs = 800 } = {}) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return res.json();
    }

    const status = res.status;
    const retryAfterHeader = res.headers?.get?.('retry-after');
    const retryAfterSeconds = retryAfterHeader ? toInt(retryAfterHeader, null) : null;

    if (status === 429 || (status >= 500 && status < 600)) {
      if (attempt > maxRetries) {
        if (status === 429) throw new OpenAIRateLimitError('OpenAI API error: Too Many Requests', retryAfterSeconds);
        throw new Error(`OpenAI API error: ${status} after ${maxRetries} retries`);
      }
      const backoffMs = retryAfterSeconds
        ? retryAfterSeconds * 1000
        : Math.min(5000, baseDelayMs * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      // eslint-disable-next-line no-console
      console.warn(`OpenAI request failed with ${status}. Retrying in ${Math.round(backoffMs)}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(backoffMs);
      continue;
    }

    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} ${text && `- ${text}`}`);
  }
};

export const generateReport = async (stockData) => {
  try {
    // Determine if this is single stock data or multi-stock data
    const isMultiStock = Array.isArray(stockData) && stockData.some((item) => item.ticker);

    let prompt;
    if (isMultiStock) {
      // Condense data to reduce tokens
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

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const maxRetries = toInt(process.env.OPENAI_MAX_RETRIES, 3);
    const maxTokens = toInt(process.env.OPENAI_MAX_TOKENS, 800);

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

    const data = await callOpenAIWithRetry(payload, { maxRetries });
    return data.choices[0].message.content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating report:', error);
    throw error;
  }
};