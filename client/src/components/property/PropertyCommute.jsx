import { Bike, Car, Footprints, MapPinned } from 'lucide-react';

import { usePropertyCommute } from '../../hooks/usePropertyCommute';
import { useCommuteDestinations } from '../../hooks/useCommuteDestinations';

const MODES = [
  { key: 'drivingMin', icon: Car, label: 'Driving' },
  { key: 'walkingMin', icon: Footprints, label: 'Walking' },
  { key: 'cyclingMin', icon: Bike, label: 'Cycling' },
];

/**
 * "Commute to: Office / University" section for the Property Details page.
 * Reads destinations saved via CommuteSearchBar on the Properties list page,
 * so they carry over automatically. Renders nothing if none are saved.
 *
 * @param {{ propertyId: string }} props
 */
export default function PropertyCommute({ propertyId }) {
  const { destinations } = useCommuteDestinations();
  const { results, isLoading, error } = usePropertyCommute(propertyId, destinations);

  if (!destinations.length) return null;

  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
        <MapPinned className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        Commute to
      </h2>

      {isLoading && (
        <div className="mt-4 grid animate-pulse gap-3 sm:grid-cols-2">
          {destinations.map((d) => (
            <div key={d.id} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Could not calculate commute times right now.</p>
      )}

      {!isLoading && !error && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {results.map((r) => (
            <div key={r.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.label}</p>
              {r.available ? (
                <div className="mt-3 flex items-center gap-4">
                  {MODES.map((mode) => (
                    <span key={mode.key} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <mode.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      {r[mode.key]} min
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{r.message || 'Could not compute commute'}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
