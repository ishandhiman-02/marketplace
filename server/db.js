import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    '\n  DATABASE_URL is not set.\n' +
    '  Create a .env file (see .env.example), for example:\n' +
    '  DATABASE_URL=postgres://user:password@localhost:5432/substore\n',
  );
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // managed Postgres (Neon/Render/RDS) usually requires SSL
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

/** Small helper — `const rows = await q('select ...', [a, b])` */
export async function q(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/** A single row, or undefined */
export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows[0];
}
