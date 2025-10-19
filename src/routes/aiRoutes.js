 
import express from 'express';
import { analyzeFile, getInsights, deleteInsights } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/analyze/:fileId', analyzeFile);
router.get('/insights/:fileId', getInsights);
router.delete('/insights/:fileId', deleteInsights);

export default router;
