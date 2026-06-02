import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import predictRoutes from './routes/predictroutes.js';
import { swaggerSpec } from './utils/swagger.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(cors());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/predict', predictRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;