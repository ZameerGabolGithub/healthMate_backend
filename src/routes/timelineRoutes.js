 
import express from 'express';
import { getTimeline, getTimelineStats } from '../controllers/timelineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getTimeline);
router.get('/stats', getTimelineStats);

export default router;
