import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, MapPin } from 'lucide-react';

import StatusBadge from './StatusBadge';
import { getRecentlyViewed } from '../../lib/recentlyViewed';
import { formatPrice } from '../../lib/format';

export default function RecentlyViewed({ excludeId, className = '' }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getRecentlyViewed(excludeId).slice(0, 4));
  }, [excludeId]);

  if (!items.length) return null;

  return (
    <section className={className}>
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
        <History className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        Recently Viewed
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <Link
            key={p._id}
            to={`/properties/${p._id}`}
            className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/40"
          >
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              {p.image && (
                <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                {p.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3 shrink-0" />
                {p.city}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(p.price, p.status)}
                </span>
                <StatusBadge status={p.status} className="px-1.5 py-0.5 text-[10px]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
