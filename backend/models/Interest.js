import mongoose from 'mongoose';

const InterestSchema = new mongoose.Schema({
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
  // Fields displayed in the frontend
  businessName: String,
  industry: String,
  contactName: String,
  contactEmail: String,
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'In Discussion', 'Declined', 'Invested'],
    default: 'Pending'
  },
  message: String,
  dateInterested: {
    type: Date,
    default: Date.now
  }
});

// Make sure an investor can't express interest in the same business twice
InterestSchema.index({ investor: 1, business: 1 }, { unique: true });

export default mongoose.model('Interest', InterestSchema);