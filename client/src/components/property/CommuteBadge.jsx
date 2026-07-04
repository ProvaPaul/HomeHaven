import { Car, Footprints, Loader2 } from 'lucide-react';

/**
 * Small badge showing driving/walking commute time to the active destination.
 * Rendered on PropertyCard when Commute-Time Search is active.
 *
 * @param {{ commute: {available?:boolean, drivingMin?:number, walkingMin?:number} | undefined, isLoading: boolean }} props
 */
export default function CommuteBadge({ commute, isLoading }) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-500 shadow-sm backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Commute…
      </span>
    );
  }

  if (!commute?.available) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur dark:bg-gray-900/90 dark:text-gray-200">
      <span className="flex items-center gap-1">
        <Car className="h-3 w-3 text-primary-600 dark:text-primary-400" />
        {commute.drivingMin}m
      </span>
      <span className="flex items-center gap-1">
        <Footprints className="h-3 w-3 text-gray-400" />
        {commute.walkingMin}m
      </span>
    </span>
  );
}
