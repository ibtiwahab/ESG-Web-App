import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  businessName: String,  // Added explicitly
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Business listing fields - explicitly defined
  industry: String,
  location: String,
  investmentNeeded: Number,
  
  // Status fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Post', postSchema);