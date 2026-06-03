import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import transactionRoutes from './routes/transactionroutes.js';
import profileRoutes from './routes/profileroutes.js';
import predictRoutes from './routes/predictroutes.js';
import { swaggerSpec } from './utils/swagger.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

const allowedOrigins = [
  'https://fullstack-gcqi-8wyrgt6xo-capstonedicoding.vercel.app', 
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: "success",
    message: "Server Backend Capstone Financial API Berhasil Berjalan di Vercel!"
  });
});

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