import express from 'express';
const router = express.Router();

import { getCashflowPrediction } from '../controller/predictcontroller.js';

router.get('/cashflow', getCashflowPrediction);

export default router;