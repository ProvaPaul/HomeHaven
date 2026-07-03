import { Router } from 'express';
import {
  getProperties,
  getFeaturedProperties,
  getPropertyMeta,
  getProperty,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  contactSeller,
  getMyInquiries,
} from '../controllers/propertyController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/').get(getProperties).post(protect, createProperty);
router.get('/featured', getFeaturedProperties);
router.get('/meta', getPropertyMeta);
router.get('/user/me', protect, getMyProperties);
router.get('/inquiries/me', protect, getMyInquiries);
router.route('/:id').get(getProperty).put(protect, updateProperty).delete(protect, deleteProperty);
router.get('/:id/similar', getSimilarProperties);
router.post('/:id/contact', contactSeller);

export default router;
