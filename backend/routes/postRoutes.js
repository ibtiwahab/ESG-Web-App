import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getPendingPosts,
  reviewPost,
  getOwnPosts,
  getReviewHistory,
  deletePost,
  updatePost  // Add this new import
} from '../controllers/postController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes
router.use(protect);

// Business owner routes
router.post('/create', authorizeRoles('business_owner'), createPost);
router.get('/user/posts', getOwnPosts);
router.delete('/:id', authorizeRoles('business_owner'), deletePost);
router.put('/:id', authorizeRoles('business_owner'), updatePost);  // Add this line for update functionality

// Admin routes
router.get('/admin/pending', authorizeRoles('admin', 'superadmin'), getPendingPosts);
router.put('/admin/review/:id', authorizeRoles('admin', 'superadmin'), reviewPost);

// Super admin routes
router.get('/admin/history', authorizeRoles('superadmin'), getReviewHistory);

export default router;