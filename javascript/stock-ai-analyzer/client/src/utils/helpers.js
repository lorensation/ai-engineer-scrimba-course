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