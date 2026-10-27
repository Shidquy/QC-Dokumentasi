// backend/routes/fileRoutes.js
import { Router } from 'express';
import {
  getAllFoldersAndFiles,
  createFolder,
  renameFolder,
  deleteFolder,
  handleFileUploadRecord,
  deleteFile,
  downloadFile,
} from '../controllers/fileController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { authenticateToken, requireDownloadAccess, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Folders
router.get('/folders', getAllFoldersAndFiles);
router.post('/folders', authenticateToken, requireAdmin, createFolder);
router.put('/folders/rename', authenticateToken, requireAdmin, renameFolder);
router.delete('/folders', authenticateToken, requireAdmin, deleteFolder);

// Files
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), handleFileUploadRecord);
router.delete('/files', authenticateToken, requireAdmin, deleteFile);

// Download - Hanya dapat diakses oleh user terautentikasi non-guest (Admin)
router.get('/download', authenticateToken, requireDownloadAccess, downloadFile);

export default router;
