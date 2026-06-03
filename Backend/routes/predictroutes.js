import express from 'express';
import { verifyToken } from '../middlewares/authmiddlewares.js'; // sesuaikan path
import { getCashflowPrediction } from '../controller/predictcontroller.js';

const router = express.Router();
router.get('/insights', verifyToken, getInsights);
router.get('/', verifyToken, getTransactions);
router.get('/cashflow', verifyToken, getCashflowPrediction);
router.post('/cashflow', verifyToken, getCashflowPrediction);

export default router;