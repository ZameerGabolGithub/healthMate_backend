 
import express from 'express';
import { uploadFile, getFiles, getFileById, deleteFile } from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import upload, { handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/upload', upload.single('file'), handleMulterError, uploadFile);
router.get('/', getFiles);
router.get('/:id', getFileById);
router.delete('/:id', deleteFile);

export default router;
