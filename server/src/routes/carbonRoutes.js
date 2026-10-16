import { Router } from 'express';
import {
  getCarbonSummary,
  getCarbonBudgets,
  getCarbonPassport,
  submitPledge
} from '../controllers/carbonController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/summary', getCarbonSummary);
router.get('/budgets', getCarbonBudgets);
router.get('/passport', authenticateToken, getCarbonPassport);
router.post('/pledge', authenticateToken, submitPledge);

export default router;
