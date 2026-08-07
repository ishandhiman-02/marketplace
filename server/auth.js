import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { one } from './db.js';

const SECRET = process.env.JWT_SECRET;
const TTL = '7d';

if (!SECRET || SECRET.length < 24) {
  console.error(
    '\n  JWT_SECRET is not set (or is too short).\n' +
    '  Put a long random string in .env:\n' +
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

/** Guards admin-only routes. Missing or invalid token means 401. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in required' });

  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }
}
