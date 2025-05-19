import mongoose from 'mongoose';

const SavedBusinessSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // Additional fields that are used in the frontend
  businessName: String,
  industry: String,
  location: String,
  investmentNeeded: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Make sure an investor can't save the same business twice
SavedBusinessSchema.index({ investor: 1, business: 1 }, { unique: true });

export default mongoose.model('SavedBusiness', SavedBusinessSchema);