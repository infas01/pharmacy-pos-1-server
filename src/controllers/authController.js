import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  });

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  return res.json({ user: req.user });
};

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const ok = await comparePassword(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await hashPassword(newPassword);
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};