// backend/routes/documentRoutes.js
import { Router } from 'express';
import {
  getAllDocuments,
  getDocumentStats,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';

const router = Router();

router.get('/', getAllDocuments);
router.get('/stats', getDocumentStats);
router.post('/', createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;

