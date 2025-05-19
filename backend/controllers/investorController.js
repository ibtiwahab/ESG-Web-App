import SavedBusiness from '../models/SavedBusiness.js';
import Interest from '../models/Interest.js';
import Post from '../models/Post.js';

// Get all saved businesses for the current investor
export const getSavedBusinesses = async (req, res) => {
  try {
    const savedBusinesses = await SavedBusiness.find({ investor: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(savedBusinesses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved businesses', error: err.message });
  }
};

// Save a business for the current investor
export const saveBusiness = async (req, res) => {
  const { businessId } = req.body;

  try {
    // Check if business exists
    const business = await Post.findOne({ _id: businessId, status: 'approved' });
    if (!business) {
      return res.status(404).json({ message: 'Business post not found or not approved' });
    }

    // Check if already saved
    const existing = await SavedBusiness.findOne({ 
      investor: req.user._id, 
      business: businessId 
    });

    if (existing) {
      return res.status(400).json({ message: 'Business already saved' });
    }

    // Create saved business record with details needed for frontend display
    const savedBusiness = await SavedBusiness.create({
      investor: req.user._id,
      business: businessId,
      businessName: business.title,
      industry: business.industry || 'Not specified',
      location: business.location || 'Not specified',
      investmentNeeded: business.investmentNeeded || 0
    });

    res.status(201).json(savedBusiness);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save business', error: err.message });
  }
};

// Remove a saved business
export const removeSavedBusiness = async (req, res) => {
  try {
    const result = await SavedBusiness.findOneAndDelete({
      _id: req.params.id,
      investor: req.user._id
    });

    if (!result) {
      return res.status(404).json({ message: 'Saved business not found' });
    }

    res.status(200).json({ message: 'Business removed from saved list' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove saved business', error: err.message });
  }
};

// Get all investment interests for the current investor
export const getInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ investor: req.user._id })
      .sort({ dateInterested: -1 });
    
    res.status(200).json(interests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch interests', error: err.message });
  }
};

// Express interest in a business
export const expressInterest = async (req, res) => {
  const { businessId, message } = req.body;

  try {
    // Check if business exists
    const business = await Post.findOne({ _id: businessId, status: 'approved' })
      .populate('createdBy', 'name email');
      
    if (!business) {
      return res.status(404).json({ message: 'Business post not found or not approved' });
    }

    // Check if already expressed interest
    const existing = await Interest.findOne({ 
      investor: req.user._id, 
      business: businessId 
    });

    if (existing) {
      return res.status(400).json({ message: 'Interest already expressed for this business' });
    }

    // Create interest record
    const interest = await Interest.create({
      investor: req.user._id,
      business: businessId,
      businessName: business.title,
      industry: business.industry || 'Not specified',
      contactName: business.createdBy.name,
      contactEmail: business.createdBy.email,
      message,
      status: 'Pending'
    });

    // In a real app, you might want to send an email notification here
    // to the business owner

    res.status(201).json(interest);
  } catch (err) {
    res.status(500).json({ message: 'Failed to express interest', error: err.message });
  }
};