import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create a new post (UPDATED)
export const createPost = async (req, res) => {
  const { title, businessName, description, industry, location, investmentNeeded } = req.body;
  
  try {
    const newPost = await Post.create({
      title: title || businessName,
      businessName: businessName || title,
      description,
      industry,
      location,
      investmentNeeded: parseInt(investmentNeeded, 10) || 0,
      createdBy: req.user._id,
      status: 'pending'
    });
    
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find({ status: 'approved' })
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ status: 'approved' });
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get posts', error: err.message });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get post', error: err.message });
  }
};

// Get pending posts for admin approval
export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get pending posts', error: err.message });
  }
};

// Approve or reject post
export const reviewPost = async (req, res) => {
  const { status, rejectionReason } = req.body;
  
  try {
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.status !== 'pending') {
      return res.status(400).json({ message: 'Post has already been reviewed' });
    }
    
    post.status = status;
    post.approvedBy = req.user._id;
    
    if (status === 'rejected' && rejectionReason) {
      post.rejectionReason = rejectionReason;
    }
    
    await post.save();
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to review post', error: err.message });
  }
};

// Get own posts (for business owners)
export const getOwnPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get posts', error: err.message });
  }
};

// Get posts review history (for super admin)
export const getReviewHistory = async (req, res) => {
  try {
    const posts = await Post.find({ status: { $ne: 'pending' } })
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get review history', error: err.message });
  }
};
// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the user is the creator of the post
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to delete this post' 
      });
    }
    
    // Check if the post is already approved
    if (post.status === 'approved') {
      return res.status(400).json({ 
        message: 'Approved posts cannot be deleted' 
      });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to delete post', 
      error: err.message 
    });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the user is the creator of the post
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to update this post' 
      });
    }
    
    // Check if the post is already approved
    if (post.status === 'approved') {
      return res.status(400).json({ 
        message: 'Approved posts cannot be edited. Please contact support.' 
      });
    }
    
    // Update post fields
    const { title, businessName, description, industry, location, investmentNeeded } = req.body;
    
    post.title = title || businessName;
    post.businessName = businessName || title;
    post.description = description;
    post.industry = industry;
    post.location = location;
    post.investmentNeeded = investmentNeeded;
    
    // When updating an existing post, reset its status to pending
    post.status = 'pending';
    post.rejectionReason = '';
    post.approvedBy = null;
    
    const updatedPost = await post.save();
    
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to update post', 
      error: err.message 
    });
  }
};