import { Router } from 'express';
import {
  getSavedSearches,
  addSavedSearch,
  deleteSavedSearch,
} from '../controllers/userController.js';
import { getMyDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/dashboard', getMyDashboard);
router.route('/saved-searches').get(getSavedSearches).post(addSavedSearch);
router.delete('/saved-searches/:searchId', deleteSavedSearch);

export default router;
