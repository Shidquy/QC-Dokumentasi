// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { getUploadDir } from './controllers/fileController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup folder upload
const uploadDir = getUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Folder upload dibuat: ${uploadDir}`);
}

// Serve Static Uploads
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', fileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'QC-Dokumentasi Backend API', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📁 Upload folder: ${uploadDir}`);
  await testConnection();
});
