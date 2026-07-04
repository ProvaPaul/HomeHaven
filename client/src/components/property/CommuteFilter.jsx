import { Clock } from 'lucide-react';
import Input from '../ui/Input';

/**
 * Max-commute-time filter + sort-by-shortest-commute toggle. Only rendered
 * when a commute destination is active (see CommuteSearchBar).
 *
 * @param {{
 *   maxMinutes: string,
 *   onMaxMinutesChange: (value:string) => void,
 *   sortByCommute: boolean,
 *   onSortByCommuteChange: (value:boolean) => void,
 * }} props
 */
export default function CommuteFilter({ maxMinutes, onMaxMinutesChange, sortByCommute, onSortByCommuteChange }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <Input
        type="number"
        min="1"
        placeholder="Max drive (min)"
        aria-label="Maximum commute time in minutes"
        value={maxMinutes}
        onChange={(e) => onMaxMinutesChange(e.target.value)}
        icon={Clock}
        className="w-40"
      />
      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={sortByCommute}
          onChange={(e) => onSortByCommuteChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-700"
        />
        Sort by shortest commute
      </label>
    </div>
  );
}
