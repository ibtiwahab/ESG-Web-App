
import express from 'express';
import {
  getSavedBusinesses,
  saveBusiness,
  removeSavedBusiness,
  getInterests,
  expressInterest
} from '../controllers/investorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require investor role
router.use(protect);
router.use(authorizeRoles('investor'));

// Saved businesses routes
router.get('/saved', getSavedBusinesses);
router.post('/saved', saveBusiness);
router.delete('/saved/:id', removeSavedBusiness);

// Interest routes
router.get('/interests', getInterests);
router.post('/interests', expressInterest);

export default router;