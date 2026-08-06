import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../db.js';

const dir = path.resolve(process.cwd(), 'server/migrations');

const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  const sql = await fs.readFile(path.join(dir, file), 'utf8');
  process.stdout.write(`  running ${file} … `);
  await pool.query(sql);
  console.log('ok');
}

console.log(`\n  ${files.length} migration(s) done.`);
await pool.end();
