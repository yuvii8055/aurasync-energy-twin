import { Router } from 'express';
import { login, register, verifyPasskey, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify-passkey', authenticateToken, verifyPasskey);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
