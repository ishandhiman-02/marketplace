import { Router } from 'express';
import { signToken, verifyCredentials, requireAuth } from '../auth.js';

export const auth = Router();

auth.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Both email and password are required' });
    }

    const user = await verifyCredentials(email, password);
    // Same message for a wrong email and a wrong password — otherwise an
    // attacker can work out which emails are registered
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    return res.json({ token: signToken(user), user: { id: user.id, email: user.email } });
  } catch (e) { return next(e); }
});

/** Session check for the frontend — is the token still valid? */
auth.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email } });
});
