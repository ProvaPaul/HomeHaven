import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, MapPin } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/dashboard/EmptyState';
import StatusBadge from '../../components/property/StatusBadge';
import { getRecentlyViewed } from '../../lib/recentlyViewed';
import { formatPrice, formatArea, timeAgo } from '../../lib/format';

export default function RecentlyViewedPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  const clearAll = () => {
    localStorage.removeItem('homehaven-recently-viewed');
    setItems([]);
  };

  return (
    <>
      <PageHeader
        title="Recently Viewed"
        subtitle="Properties you looked at recently (stored on this device)."
        action={
          items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Clear history
            </button>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nothing viewed yet"
          message="Properties you open will show up here so you can find them again."
          actionTo="/properties"
          actionLabel="Browse Properties"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p._id}
              to={`/properties/${p._id}`}
              className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/40"
            >
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {p.image && <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {p.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {p.city} · {formatArea(p.area)}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(p.price, p.status)}
                  </span>
                  <StatusBadge status={p.status} className="px-1.5 py-0.5 text-[10px]" />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">Viewed {timeAgo(p.viewedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
