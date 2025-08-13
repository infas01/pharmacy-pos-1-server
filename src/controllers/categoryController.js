import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const listCategories = async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json(cats);
};

export const createCategory = async (req, res) => {
  const { name, description, isActive = true } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Category already exists' });
  const cat = await Category.create({ name, description, isActive });
  res.status(201).json(cat);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const cat = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const inUse = await Product.exists({ category: id });
  if (inUse) return res.status(400).json({ message: 'Category is in use by products' });
  const del = await Category.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Deleted' });
};