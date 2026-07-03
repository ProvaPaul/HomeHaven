import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route GET /api/favorites
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    populate: { path: 'owner', select: 'name avatar' },
  });

  res.json({ success: true, favorites: user.favorites });
});

// @route POST /api/favorites/:propertyId — toggle
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  if (!mongoose.isValidObjectId(propertyId)) {
    throw new ApiError(400, 'Invalid property id');
  }

  const property = await Property.findById(propertyId).select('_id');
  if (!property) throw new ApiError(404, 'Property not found');

  const user = await User.findById(req.user._id);
  const isFavorite = user.favorites.some((id) => id.toString() === propertyId);

  if (isFavorite) {
    user.favorites = user.favorites.filter((id) => id.toString() !== propertyId);
  } else {
    user.favorites.push(propertyId);
  }
  await user.save();

  res.json({
    success: true,
    message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    isFavorite: !isFavorite,
    favoriteIds: user.favorites,
  });
});
