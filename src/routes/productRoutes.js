import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listProducts, createProduct, updateProduct, deleteProduct, expiringBatches } from '../controllers/productController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listProducts);
router.get('/expired', expiringBatches);
router.post('/', requireRole(['Admin', 'Sub Admin']), createProduct);
router.put('/:id', requireRole(['Admin', 'Sub Admin']), updateProduct);
router.delete('/:id', requireRole(['Admin']), deleteProduct);

export default router;