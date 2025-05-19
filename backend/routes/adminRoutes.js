import express from 'express';
import {
  createAdmin,
  getAdmins,
  deleteAdmin,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create', authorizeRoles('superadmin'), createAdmin);
router.get('/list', authorizeRoles('superadmin'), getAdmins);
router.delete('/:id', authorizeRoles('superadmin'), deleteAdmin);

export default router;