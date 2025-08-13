import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const listProducts = async (req, res) => {
  const { q = '', category, page = 1, limit = 20, onlyActive } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (onlyActive) filter.isActive = onlyActive === 'true';

  const agg = [ { $match: filter } ];
  agg.push({ $addFields: { stock: { $sum: '$batches.quantity' } } });
  agg.push({ $sort: { name: 1 } });
  agg.push({ $skip: (Number(page) - 1) * Number(limit) });
  agg.push({ $limit: Number(limit) });

  const [items, total] = await Promise.all([
    Product.aggregate(agg),
    Product.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

export const createProduct = async (req, res) => {
  const { name, sku, barcode, category, brand, unit, batches = [], isActive = true } = req.body;
  if (!name || !category) return res.status(400).json({ message: 'Name and category are required' });
  const prod = await Product.create({ name, sku, barcode, category, brand, unit, batches, isActive });
  res.status(201).json(prod);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const prod = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  res.json(prod);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const prod = await Product.findByIdAndDelete(id);
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Deleted' });
};

export const expiringBatches = async (req, res) => {
  const withinDays = Number(req.query.withinDays || 30);
  const now = new Date();
  const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $unwind: '$batches' },
    { $match: { 'batches.quantity': { $gt: 0 }, 'batches.expiryDate': { $lte: threshold } } },
    { $addFields: { stock: '$batches.quantity' } },
    { $project: { name: 1, sku: 1, category: 1, 'batches.batchNo': 1, 'batches.expiryDate': 1, 'batches.quantity': 1, 'batches.salePrice': 1 } },
    { $sort: { 'batches.expiryDate': 1 } }
  ];

  const items = await Product.aggregate(pipeline);
  res.json({ withinDays, items });
};