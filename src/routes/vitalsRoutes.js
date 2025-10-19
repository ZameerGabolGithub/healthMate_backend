 
import express from 'express';
import { 
  addVitals, 
  getVitals, 
  getVitalsById, 
  updateVitals, 
  deleteVitals 
} from '../controllers/vitalsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', addVitals);
router.get('/', getVitals);
router.get('/:id', getVitalsById);
router.put('/:id', updateVitals);
router.delete('/:id', deleteVitals);

export default router;
