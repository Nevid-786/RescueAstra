import { Router } from 'express';
import { register, login, getMe, createRescueTeamAccount } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register - Public registration (Strictly CITIZEN role)
router.post('/register', register);

// POST /api/auth/login - Authentication sign-in
router.post('/login', login);

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, getMe);

// POST /api/auth/create-responder - Admin-only route to create Rescue Team accounts
router.post('/create-responder', authenticateToken, requireRole(['ADMIN']), createRescueTeamAccount);

export default router;
