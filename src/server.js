import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoriesRoutes from './routes/categoryRoutes.js';
import productsRoutes from './routes/productRoutes.js';
import invoicesRoutes from './routes/invoiceRoutes.js';

dotenv.config();
await connectDB();

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: false, // using Authorization header; no cookies
  })
);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/invoices', invoicesRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
