import { describe, it, expect } from 'vitest';
import { fetchResolvedTicker, fetchStockData, generateReport } from '../client/src/utils/api.js';

describe('Client API Functions', () => {
  it('should fetch resolved ticker for a valid company name', async () => {
    const ticker = await fetchResolvedTicker('Apple Inc');
    expect(ticker).toBe('AAPL');
  });

  it('should fetch stock data for a valid ticker', async () => {
    const stockData = await fetchStockData('AAPL');
    expect(stockData).toHaveProperty('symbol', 'AAPL');
    expect(stockData).toHaveProperty('data');
  });

  it('should generate a concise financial report', async () => {
    const report = await generateReport({ ticker: 'AAPL', days: 3 });
    expect(report).toContain('Apple Inc');
    expect(report).toContain('financial summary');
  });
});