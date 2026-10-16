import { Router } from 'express';
import { getAllBins, emptyBin } from '../controllers/binsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllBins);
router.post('/:id/empty', authenticateToken, emptyBin);

export default router;
