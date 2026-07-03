import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import PropertyGrid from '../components/property/PropertyGrid';
import { fetchFavorites, selectFavorites } from '../features/favorites/favoritesSlice';

export default function Favorites() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(selectFavorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <div>
      <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900 dark:text-white">
        <Heart className="h-6 w-6 fill-red-500 text-red-500" />
        My Wishlist
      </h1>
      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
        Properties you've saved for later.
      </p>

      <div className="mt-8">
        <PropertyGrid
          properties={items}
          isLoading={status === 'loading' || status === 'idle'}
          emptyTitle="Your wishlist is empty"
          emptyMessage="Tap the heart icon on any property to save it here."
        />
      </div>

      {status === 'succeeded' && items.length === 0 && (
        <div className="mt-6 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
}
