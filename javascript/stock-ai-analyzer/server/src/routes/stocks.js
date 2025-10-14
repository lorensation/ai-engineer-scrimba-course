import express from 'express';
import { resolveTicker, fetchStockData, generateReport, generateMultiStockReport } from '../controllers/stockController.js';

const router = express.Router();

router.get('/resolve', resolveTicker);
router.get('/stock', fetchStockData);
router.post('/report', generateReport);
router.post('/multi-stock-report', generateMultiStockReport);

export default router;