import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MAX_SAVED_SEARCHES = 20;

// @route GET /api/users/saved-searches
export const getSavedSearches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('savedSearches');
  res.json({ success: true, savedSearches: user.savedSearches });
});

// @route POST /api/users/saved-searches
export const addSavedSearch = asyncHandler(async (req, res) => {
  const { name, query } = req.body;
  if (!name?.trim() || typeof query !== 'string') {
    throw new ApiError(400, 'Name and query are required');
  }

  const user = await User.findById(req.user._id);
  if (user.savedSearches.length >= MAX_SAVED_SEARCHES) {
    throw new ApiError(400, `You can save up to ${MAX_SAVED_SEARCHES} searches`);
  }
  if (user.savedSearches.some((s) => s.query === query)) {
    throw new ApiError(409, 'You already saved this search');
  }

  user.savedSearches.push({ name: name.trim(), query });
  await user.save();

  res.status(201).json({ success: true, savedSearches: user.savedSearches });
});

// @route DELETE /api/users/saved-searches/:searchId
export const deleteSavedSearch = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const before = user.savedSearches.length;
  user.savedSearches = user.savedSearches.filter(
    (s) => s._id.toString() !== req.params.searchId
  );
  if (user.savedSearches.length === before) {
    throw new ApiError(404, 'Saved search not found');
  }
  await user.save();

  res.json({ success: true, savedSearches: user.savedSearches });
});
