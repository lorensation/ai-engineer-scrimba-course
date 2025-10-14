import { fetchStockData as polygonFetchStockData, resolveTicker as polygonResolveTicker } from '../services/polygonService.js';
import { generateReport as openaiGenerateReport, OpenAIRateLimitError } from '../services/openaiService_v2.js';

export const resolveTicker = async (req, res) => {
  const { q } = req.query;
  try {
    const resolvedTicker = await polygonResolveTicker(q);
    res.json({ status: 'success', data: resolvedTicker });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const fetchStockData = async (req, res) => {
  const { tickers, days = 3 } = req.query;
  try {
    const stockData = await polygonFetchStockData(tickers, days);
    res.json({ status: 'success', data: stockData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const generateReport = async (req, res) => {
  const { stockData } = req.body;
  try {
    const report = await openaiGenerateReport(stockData);
    res.json({ status: 'success', report });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const generateMultiStockReport = async (req, res) => {
  const { stocks } = req.body;
  
  if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid stocks array provided' });
  }
  
  try {
    // Fetch stock data for all stocks
    const stockDataPromises = stocks.map(async (stock) => {
      try {
        const stockData = await polygonFetchStockData(stock.ticker, 3);
        return {
          ticker: stock.ticker,
          name: stock.name,
          data: stockData
        };
      } catch (error) {
        console.error(`Failed to fetch data for ${stock.ticker}:`, error);
        return {
          ticker: stock.ticker,
          name: stock.name,
          error: error.message
        };
      }
    });
    
    const allStockData = await Promise.all(stockDataPromises);
    console.log('Fetched data for all stocks:', allStockData);
    
    // Generate combined report
    const report = await openaiGenerateReport(allStockData);
    res.json({ status: 'success', report });
    
  } catch (error) {
    console.error('Multi-stock report generation failed:', error);
    if (error?.isRateLimit) {
      if (error.retryAfterSeconds) {
        res.set('Retry-After', `${error.retryAfterSeconds}`);
      }
      return res.status(429).json({ status: 'error', message: error.message, retryAfter: error.retryAfterSeconds || null });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};