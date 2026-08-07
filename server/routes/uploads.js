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
  limits: { fileSize: 8 * 1024 * 1024 }, // the browser has already compressed it
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    return cb(null, true);
  },
});

/** Removes a file from disk — used when deleting proofs */
export async function removeUpload(publicUrl) {
  const name = path.basename(publicUrl || '');
  if (name) await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}

export const uploads = Router();

/**
 * Only stores the file and returns a URL — no DB row is created.
 * Product images come through here (proofs get their own row).
 */
uploads.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  return res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
