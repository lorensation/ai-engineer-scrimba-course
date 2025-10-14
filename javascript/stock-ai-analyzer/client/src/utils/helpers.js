// Helper functions for the stock AI analyzer application

export const formatStockData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(stock => ({
    ticker: stock.ticker || stock.T,
    open: stock.o,
    close: stock.c,
    high: stock.h,
    low: stock.l,
    volume: stock.v,
    date: new Date(stock.t).toLocaleDateString()
  }));
};

export const normalizeInput = (input) => {
  if (!input || typeof input !== 'string') return [];
  return input.trim().toUpperCase().split(',').map(ticker => ticker.trim()).filter(Boolean);
};

export const validateTicker = (ticker) => {
  if (!ticker || typeof ticker !== 'string') return false;
  // Basic ticker validation - typically 1-5 uppercase letters
  const tickerRegex = /^[A-Z]{1,5}$/;
  return tickerRegex.test(ticker.trim().toUpperCase());
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatVolume = (volume) => {
  if (typeof volume !== 'number') return '0';
  
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M';
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K';
  }
  
  return volume.toLocaleString();
};

export const handleError = (error) => {
  console.error('An error occurred:', error);
  return { status: 'error', message: error.message || 'An unknown error occurred' };
};

// Very small markdown-ish formatter for OpenAI/OpenRouter responses
// Supports:
// - Lines starting with '## ' or '**Title**' as headings
// - '**bold**' segments
// - Lines starting with '-' or '*' as bullet items
// - Paragraphs separated by blank lines
export const formatMarkdownishToHTML = (text) => {
  if (!text || typeof text !== 'string') return '';

  // Normalize newlines
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  const html = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) {
      // Blank line => paragraph break
      flushList();
      html.push('<br/>');
      continue;
    }

    // Heading patterns
    if (line.startsWith('## ')) {
      flushList();
      const content = line.slice(3);
      html.push(`<h4>${escapeHtml(content)}</h4>`);
      continue;
    }

    // Some models output headings like '**Overview**'
    const headingMatch = line.match(/^\*\*(.+?)\*\*:?$/);
    if (headingMatch && headingMatch[1].length < 60) {
      flushList();
      html.push(`<h4>${escapeHtml(headingMatch[1])}</h4>`);
      continue;
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      const item = line.replace(/^[-*]\s+/, '');
      html.push(`<li>${inlineBold(escapeHtml(item))}</li>`);
      continue;
    }

    // Fallback paragraph line
    flushList();
    html.push(`<p>${inlineBold(escapeHtml(line))}</p>`);
  }

  flushList();
  return html.join('\n');
};

const inlineBold = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');