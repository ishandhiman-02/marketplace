import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from './routes/auth.js';
import { products } from './routes/products.js';
import { offers } from './routes/offers.js';
import { proofs } from './routes/proofs.js';
import { uploads, UPLOAD_DIR } from './routes/uploads.js';
import { leads } from './routes/leads.js';
import { pool } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

// proof screenshots — public read
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('select 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'down', error: e.message });
  }
});

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/offers', offers);
app.use('/api/proofs', proofs);
app.use('/api/uploads', uploads);
app.use('/api/leads', leads);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || (err instanceof SyntaxError ? 400 : 500);
  res.status(status).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`  API ready on http://localhost:${PORT}`);
});
