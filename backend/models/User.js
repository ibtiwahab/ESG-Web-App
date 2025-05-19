import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'business_owner', 'investor'],
    default: 'investor',
  },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
