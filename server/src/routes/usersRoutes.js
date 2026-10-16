import { Router } from 'express';
import { getAllUsers, approveUser, getAllWorkers, getSystemAuditLogs } from '../controllers/usersController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/permissions.js';

const router = Router();

router.get('/', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), getAllUsers);
router.patch('/:id/approve', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), approveUser);
router.get('/workers', authenticateToken, getAllWorkers);
router.get('/audit-logs', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), getSystemAuditLogs);

export default router;
