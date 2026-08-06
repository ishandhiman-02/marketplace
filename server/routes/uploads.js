import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { requireAuth } from '../auth.js';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'server/uploads');
await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // browser pehle hi compress karta hai
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Sirf image files chalengi'));
    return cb(null, true);
  },
});

/** Disk se file hataata hai — proofs delete karte waqt kaam aata hai */
export async function removeUpload(publicUrl) {
  const name = path.basename(publicUrl || '');
  if (name) await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}

export const uploads = Router();

/**
 * Sirf file store karta hai aur URL wapas deta hai — koi DB row nahi banti.
 * Product images isi se aati hain (proofs ki apni row hoti hai).
 */
uploads.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Koi file nahi mili' });
  return res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
