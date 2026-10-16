import { Router } from 'express';
import {
  toggleDevice,
  campusMasterEcoSwitch,
  emergencyShutdown,
  undoControlAction,
  getControlAuditLogs
} from '../controllers/controlController.js';
import { authenticateToken, requirePasskey, requireRole } from '../middleware/auth.js';
import { ROLES } from '../config/permissions.js';

const router = Router();

router.post('/device', authenticateToken, toggleDevice);
// Master Eco Switch requires HOD or Admin + Passkey verification
router.post('/campus-eco', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), requirePasskey, campusMasterEcoSwitch);
router.post('/emergency', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), emergencyShutdown);
router.post('/undo', authenticateToken, requireRole(ROLES.ADMIN, ROLES.HOD), undoControlAction);
router.get('/actions', authenticateToken, getControlAuditLogs);

export default router;
