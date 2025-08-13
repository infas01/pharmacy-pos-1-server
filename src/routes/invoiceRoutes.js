import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createInvoice,
  listInvoices,
  getInvoice,
} from '../controllers/invoiceController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listInvoices);
router.get('/:id', getInvoice);
router.post('/', requireRole(['Admin', 'Sub Admin', 'Cashier']), createInvoice);

export default router;
