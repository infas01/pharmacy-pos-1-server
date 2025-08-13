import User from '../models/User.js';
import { hashPassword } from '../utils/hash.js';

export const listUsers = async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

export const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: 'username, password, role are required' });
  const exists = await User.findOne({ username: username.toLowerCase() });
  if (exists) return res.status(400).json({ message: 'Username already exists' });
  const user = await User.create({ username: username.toLowerCase(), role, password: await hashPassword(password) });
  res.status(201).json({ id: user._id, username: user.username, role: user.role });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body; // if not provided, default
  const pwd = newPassword || 'Password@123';
  const user = await User.findByIdAndUpdate(id, { password: await hashPassword(pwd) }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Password reset', username: user.username });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const del = await User.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Deleted' });
};