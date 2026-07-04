import { SearchX } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import { cn } from '../../lib/utils';

export default function PropertyGrid({
  properties = [],
  isLoading = false,
  skeletonCount = 6,
  emptyTitle = 'No properties found',
  emptyMessage = 'Try adjusting your search or filters.',
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  commutes = null,
  isCommuteLoading = false,
}) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-6', columns)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <SearchX className="h-7 w-7 text-gray-400" />
        </span>
        <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', columns)}>
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
          commute={commutes?.[property._id]}
          isCommuteLoading={isCommuteLoading && !commutes?.[property._id]}
        />
      ))}
    </div>
  );
}
