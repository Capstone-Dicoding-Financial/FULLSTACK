import express from 'express';
import { getCashflowPrediction } from '../controller/predictcontroller.js';

const router = express.Router();

router.get('/cashflow', getCashflowPrediction);
router.post('/cashflow', getCashflowPrediction);

export default router;