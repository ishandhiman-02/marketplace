import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { one } from './db.js';

const SECRET = process.env.JWT_SECRET;
const TTL = '7d';

if (!SECRET || SECRET.length < 24) {
  console.error(
    '\n  JWT_SECRET set nahi hai (ya bahut chhota hai).\n' +
    '  .env mein ek lamba random string daalein:\n' +
    '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n',
  );
  process.exit(1);
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: TTL });
}

export async function verifyCredentials(email, password) {
  const user = await one('select * from admin_users where email = $1', [String(email).toLowerCase()]);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/** Admin-only routes pe lagta hai. Token na ho ya galat ho to 401. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login zaroori hai' });

  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expire ho gaya — dobara login karein' });
  }
}
