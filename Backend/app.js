import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import transactionRoutes from './routes/transactionroutes.js';
import profileRoutes from './routes/profileroutes.js';
import predictRoutes from './routes/predictroutes.js';
import { swaggerSpec } from './utils/swagger.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed =
    origin.endsWith('.vercel.app') ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1');

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server Backend Capstone Financial API Berhasil Berjalan di Vercel!',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/predict', predictRoutes);

// ─── Start (local only) ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;