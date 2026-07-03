import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getFavorites);
router.post('/:propertyId', toggleFavorite);

export default router;
