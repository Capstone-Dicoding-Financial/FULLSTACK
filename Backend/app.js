import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authroutes.js';
import transactionRoutes from './routes/transactionroutes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/transactions', transactionRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(5000, () => console.log('Server berjalan di port 5000'));