// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_qc_dokumentasi_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Mendukung token via Header (Bearer <token>) maupun Query Parameter (?token=<token>) untuk download file
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ code: 401, error: 'Token autentikasi tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, error: 'Token tidak valid atau telah kedaluwarsa' });
    }
    req.user = user;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, error: 'Akses ditolak: Memerlukan hak akses Admin' });
  }
  next();
};

export const requireDownloadAccess = (req, res, next) => {
  if (!req.user || req.user.role === 'guest') {
    return res.status(403).json({
      code: 403,
      error: 'Akses ditolak: Akun Guest hanya memiliki akses lihat (tidak diizinkan mendownload dokumen)',
    });
  }
  next();
};
