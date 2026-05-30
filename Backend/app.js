import express from 'express';
import cors from 'cors'; // <-- 1. Import library-nya
import authRoutes from './routes/authroutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { swaggerSpec } from './utils/swagger.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(cors()); 

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});