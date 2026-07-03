import { useEffect, useState } from 'react';
import { Bus, GraduationCap, MapPin, Stethoscope, UtensilsCrossed } from 'lucide-react';

import api from '../../lib/axios';

const CATEGORIES = [
  { key: 'schools', label: 'Schools', icon: GraduationCap },
  { key: 'hospitals', label: 'Healthcare', icon: Stethoscope },
  { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { key: 'busStops', label: 'Bus Stops', icon: Bus },
];

export default function NearbyPlaces({ propertyId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    api
      .get(`/ai/nearby/${propertyId}`)
      .then(({ data }) => alive && setData(data))
      .catch(() => alive && setData({ available: false }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">What's Nearby</h2>
        <div className="mt-4 grid animate-pulse gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </section>
    );
  }

  if (!data?.available) return null;

  const hasAny = CATEGORIES.some((c) => data.places[c.key]?.length);
  if (!hasAny) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">What's Nearby</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        Around {data.location.label.split(',').slice(0, 2).join(',')} · data © OpenStreetMap
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const items = data.places[cat.key] || [];
          if (!items.length) return null;
          return (
            <div key={cat.key} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <cat.icon className="h-4 w-4" />
                </span>
                {cat.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {items.map((place) => (
                  <li key={place.name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-gray-700 dark:text-gray-300">{place.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">{place.distanceKm} km</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
