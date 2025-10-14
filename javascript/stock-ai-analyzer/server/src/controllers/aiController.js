import express from 'express';
import { fetchStockData } from '../services/polygonService.js';
import { generateReport as generateOpenRouterReport } from '../services/openrouterService.js';

export const generateReport = async (req, res) => {
  try {
    const { stockData } = req.body;
    
    if (!stockData) {
      return res.status(400).json({ status: 'error', message: 'No stock data provided' });
    }

  const report = await generateOpenRouterReport(stockData);
    res.json({ status: 'success', report });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};