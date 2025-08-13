import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listCategories);
router.post('/', requireRole(['Admin', 'Sub Admin']), createCategory);
router.put('/:id', requireRole(['Admin', 'Sub Admin']), updateCategory);
router.delete('/:id', requireRole(['Admin']), deleteCategory);

export default router;