import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

export const resolveTicker = async (ticker) => {
  try {
    const response = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error resolving ticker:', error);
    throw error;
  }
};

export const fetchStockData = async (ticker) => {
  try {
    // Get dates for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${formatDate(startDate)}/${formatDate(endDate)}?apiKey=${POLYGON_API_KEY}`
    );
    
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};