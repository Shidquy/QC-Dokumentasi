// backend/middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadDir } from '../controllers/fileController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { customer, folder } = req.body;
    if (!customer || !folder) {
      return cb(new Error('Customer dan folder harus diisi'), null);
    }
    const uploadDir = getUploadDir(req);
    const dir = path.join(uploadDir, customer, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = [
    '.pdf',
    '.xlsx',
    '.xls',
    '.jpg',
    '.jpeg',
    '.png',
    '.tif',
    '.tiff',
    '.webp',
    '.gif',
    '.bmp',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak didukung: ${ext}`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
});

