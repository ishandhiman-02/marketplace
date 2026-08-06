import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { pool, one } from '../db.js';
import { hashPassword } from '../auth.js';

const rl = readline.createInterface({ input: stdin, output: stdout });

const email = (process.argv[2] || await rl.question('Admin email: ')).trim().toLowerCase();
const password = process.argv[3] || await rl.question('Password (min 8 chars): ');
rl.close();

if (!email.includes('@')) {
  console.error('  Email theek nahi lag raha.');
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('  Password kam se kam 8 characters ka hona chahiye.');
  process.exit(1);
}

const hash = await hashPassword(password);
const row = await one(
  `insert into admin_users (email, password_hash) values ($1, $2)
   on conflict (email) do update set password_hash = excluded.password_hash
   returning email`,
  [email, hash],
);

console.log(`\n  Admin ready: ${row.email}\n  /admin/login pe login kar sakte hain.`);
await pool.end();
