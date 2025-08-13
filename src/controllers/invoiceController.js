import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';

const nextInvoiceNo = async (session) => {
  const c = await Counter.findOneAndUpdate(
    { key: 'invoice' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session }
  );
  const y = new Date().getFullYear();
  return `INV-${y}-${String(c.seq).padStart(6, '0')}`;
};

export const createInvoice = async (req, res) => {
  const {
    items = [],
    customerName = '',
    discount = 0,
    paid = 0,
    paymentMethod = 'CASH',
  } = req.body;
  if (!items.length)
    return res.status(400).json({ message: 'No items provided' });

  try {
    // Phase 1: Build FEFO deduction plan for all items (no writes yet)
    let subTotal = 0;
    const plans = []; // [{ prod, updates: [{ idx, newQty }] }]

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod) throw new Error('Product not found');

      // FEFO: sort a copy by earliest expiry
      const sorted = [...(prod.batches || [])].sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );

      let remaining = Number(it.qty);
      const updates = [];

      for (const b of sorted) {
        if (remaining <= 0) break;
        const take = Math.min(b.quantity, remaining);
        if (take > 0) {
          // find the real index in the original array to apply later
          const realIdx = prod.batches.findIndex(
            (x) => String(x._id) === String(b._id)
          );
          updates.push({ idx: realIdx, newQty: b.quantity - take });
          remaining -= take;
        }
      }

      if (remaining > 0) {
        throw new Error(`Insufficient stock for ${prod.name}`);
      }

      plans.push({ prod, updates, item: it });
      subTotal += Number(it.qty) * Number(it.price);
    }

    // Validate totals
    const grandTotal = Math.max(subTotal - Number(discount || 0), 0);
    if (Number(paid) > grandTotal) {
      throw new Error('Paid amount cannot exceed grand total');
    }

    // Phase 2: Apply all stock updates
    for (const { prod, updates } of plans) {
      for (const u of updates) {
        prod.batches[u.idx].quantity = u.newQty;
      }
      await prod.save(); // no session/transaction
    }

    // Create invoice (Counter uses atomic $inc so invoiceNo stays unique)
    const invoiceNo = await nextInvoiceNo();
    const inv = await Invoice.create({
      invoiceNo,
      customerName,
      items: items.map((it) => ({
        product: it.productId,
        name: it.name,
        sku: it.sku,
        qty: Number(it.qty),
        price: Number(it.price),
        subtotal: Number(it.qty) * Number(it.price),
      })),
      subTotal,
      discount: Number(discount || 0),
      grandTotal,
      paid: Number(paid || 0),
      paymentMethod,
      createdBy: req.user._id,
    });

    res.status(201).json(inv);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message || 'Failed to create invoice' });
  }
};

export const listInvoices = async (req, res) => {
  const { q = '', dateFrom, dateTo, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) filter.invoiceNo = new RegExp(q, 'i');
  if (dateFrom || dateTo) filter.createdAt = {};
  if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
  if (dateTo) filter.createdAt.$lte = new Date(dateTo);

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Invoice.countDocuments(filter),
  ]);
  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

export const getInvoice = async (req, res) => {
  const inv = await Invoice.findById(req.params.id).populate(
    'createdBy',
    'username'
  );
  if (!inv) return res.status(404).json({ message: 'Invoice not found' });
  res.json(inv);
};
