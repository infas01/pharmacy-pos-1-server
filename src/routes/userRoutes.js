import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { updateMyPassword } from '../controllers/authController.js';
import { listUsers, createUser, updateUser, resetPassword, deleteUser } from '../controllers/adminUserController.js';

const router = Router();

// Self
router.put('/me/password', requireAuth, updateMyPassword);

// Admin area
router.get('/', requireAuth, requireRole(['Admin', 'Sub Admin']), listUsers);
router.post('/', requireAuth, requireRole(['Admin']), createUser);
router.put('/:id', requireAuth, requireRole(['Admin', 'Sub Admin']), updateUser);
router.put('/:id/reset-password', requireAuth, requireRole(['Admin']), resetPassword);
router.delete('/:id', requireAuth, requireRole(['Admin']), deleteUser);

export default router;