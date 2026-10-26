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

const router = Router();

// Folders
router.get('/folders', getAllFoldersAndFiles);
router.post('/folders', createFolder);
router.put('/folders/rename', renameFolder);
router.delete('/folders', deleteFolder);

// Files
router.post('/upload', upload.single('file'), handleFileUploadRecord);
router.delete('/files', deleteFile);
router.get('/download', downloadFile);

export default router;

