import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAdminProperties,
  verifyProperty,
  toggleFeatured,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.use(protect, restrictTo('admin'));
router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAdminProperties);
router.put('/properties/:id/verify', verifyProperty);
router.put('/properties/:id/feature', toggleFeatured);

export default router;
