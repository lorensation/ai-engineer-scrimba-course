export const fetchResolvedTicker = async (companyName) => {
  try {
    const response = await fetch(`/api/resolve?q=${encodeURIComponent(companyName)}`);
    if (!response.ok) throw new Error('Failed to resolve ticker');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching resolved ticker:', error);
    throw error;
  }
};

export const fetchStockData = async (ticker) => {
  try {
    // Handle both single ticker string and ticker object
    const tickerSymbol = typeof ticker === 'string' ? ticker : ticker.ticker;
    const response = await fetch(`/api/stock?tickers=${encodeURIComponent(tickerSymbol)}`);
    if (!response.ok) throw new Error('Failed to fetch stock data');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const generateReport = async (stockData) => {
  try {
    const response = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockData }),
    });
    if (!response.ok) throw new Error('Failed to generate report');
    const result = await response.json();
    return result.report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// NEW: Combined function to generate reports for multiple stocks
export const generateMultiStockReport = async (stockList) => {
  try {
    const response = await fetch('/api/multi-stock-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stocks: stockList }),
    });
    if (!response.ok) throw new Error('Failed to generate multi-stock report');
    const result = await response.json();
    return result.report;
  } catch (error) {
    console.error('Error generating multi-stock report:', error);
    throw error;
  }
};