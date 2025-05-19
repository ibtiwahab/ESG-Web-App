import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const hash = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({ name, email, password: hash, role: 'admin' });

    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create admin', error: err.message });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get admins', error: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    await admin.deleteOne();
    res.status(200).json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete admin', error: err.message });
  }
};
