import express from 'express';
import { generateReport } from '../controllers/aiController.js';

const router = express.Router();

router.post('/report', generateReport);

export default router;