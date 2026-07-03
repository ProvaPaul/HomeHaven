import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { toggleFavorite, selectIsFavorite } from '../../features/favorites/favoritesSlice';
import { cn } from '../../lib/utils';

export default function FavoriteButton({ propertyId, className }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isFavorite = useSelector(selectIsFavorite(propertyId));

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Log in to save properties to your wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }

    const result = await dispatch(toggleFavorite(propertyId));
    if (toggleFavorite.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload || 'Something went wrong');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 dark:bg-gray-900/90',
        className
      )}
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px] transition',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
        )}
      />
    </button>
  );
}
