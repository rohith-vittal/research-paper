import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import paperRoutes from './routes/paperRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/papers', paperRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 5000;
connectDB().finally(() => {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
});
