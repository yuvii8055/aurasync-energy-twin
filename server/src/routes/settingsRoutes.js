import { Router } from 'express';
import {
  getEffectiveSettings,
  updateSetting,
  resetIslandPosition
} from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getEffectiveSettings);
router.patch('/:key', authenticateToken, updateSetting);
router.post('/reset-island', authenticateToken, resetIslandPosition);

export default router;
