import { Router } from 'express';
import {
  getAllFeedback,
  submitFeedback,
  replyToFeedback,
  convertFeedbackToTicket
} from '../controllers/feedbackController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/permissions.js';

const router = Router();

router.get('/', authenticateToken, getAllFeedback);
router.post('/', authenticateToken, submitFeedback);
router.patch('/:id/reply', authenticateToken, requireRole(ROLES.ADMIN), replyToFeedback);
router.post('/:id/convert-ticket', authenticateToken, requireRole(ROLES.ADMIN), convertFeedbackToTicket);

export default router;
