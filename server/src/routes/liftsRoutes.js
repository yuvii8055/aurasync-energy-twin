import { Router } from 'express';
import { getAllLifts, triggerLiftEmergency, resetLift } from '../controllers/liftsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllLifts);
router.post('/:id/emergency', authenticateToken, triggerLiftEmergency);
router.post('/:id/reset', authenticateToken, resetLift);

export default router;
