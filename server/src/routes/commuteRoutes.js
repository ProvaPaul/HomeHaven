import { Router } from 'express';
import { geocodeDestination, estimateCommutes, estimatePropertyCommutes } from '../controllers/commuteController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.use(rateLimit({ windowMs: 60000, max: 40 }));

router.post('/geocode', geocodeDestination);
router.post('/estimate', estimateCommutes);
router.post('/property/:id', estimatePropertyCommutes);

export default router;
