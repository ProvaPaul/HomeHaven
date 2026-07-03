import { Router } from 'express';
import {
  getAiStatus,
  smartSearch,
  chatSupport,
  generateDescription,
  summarizeProperty,
  getRecommendations,
  estimatePrice,
  nearbyPlaces,
  sellerInsights,
} from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.use(rateLimit({ windowMs: 60000, max: 30 }));

router.get('/status', getAiStatus);
router.post('/search', smartSearch);
router.post('/chat', chatSupport);
router.post('/describe', protect, generateDescription);
router.get('/summary/:propertyId', summarizeProperty);
router.post('/recommendations', optionalAuth, getRecommendations);
router.post('/estimate-price', estimatePrice);
router.get('/nearby/:propertyId', nearbyPlaces);
router.get('/seller-insights', protect, sellerInsights);

export default router;
