import { Router } from 'express';
import { signToken, verifyCredentials, requireAuth } from '../auth.js';

export const auth = Router();

auth.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email aur password dono chahiye' });
    }

    const user = await verifyCredentials(email, password);
    // email galat hai ya password — dono ke liye ek hi message,
    // warna attacker ko pata chal jaata hai ki kaunse emails registered hain
    if (!user) return res.status(401).json({ error: 'Email ya password galat hai.' });

    return res.json({ token: signToken(user), user: { id: user.id, email: user.email } });
  } catch (e) { return next(e); }
});

/** Frontend session check ke liye — token valid hai ya nahi */
auth.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email } });
});
