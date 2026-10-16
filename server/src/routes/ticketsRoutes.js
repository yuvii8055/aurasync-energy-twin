import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  assignTicket,
  updateTicketStatus,
  completeTicketWithPhoto,
  rateTicket
} from '../controllers/ticketsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/permissions.js';

const router = Router();

router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.post('/', authenticateToken, createTicket);
router.patch('/:id/assign', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), assignTicket);
router.patch('/:id/status', authenticateToken, updateTicketStatus);
router.post('/:id/complete', authenticateToken, completeTicketWithPhoto);
router.post('/:id/rate', authenticateToken, rateTicket);

export default router;
