import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Scale, Trash2, X } from 'lucide-react';

import StatusBadge from '../components/property/StatusBadge';
import PageLoader from '../components/common/PageLoader';
import api from '../lib/axios';
import { formatPrice, formatArea, TYPE_LABELS } from '../lib/format';
import {
  selectCompareIds,
  removeFromCompare,
  clearCompare,
} from '../features/compare/compareSlice';
import { usePageTitle } from '../hooks/usePageTitle';

const rows = [
  { label: 'Price', render: (p) => formatPrice(p.price, p.status) },
  { label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  { label: 'Type', render: (p) => TYPE_LABELS[p.type] || p.type },
  { label: 'Bedrooms', render: (p) => p.bedrooms || '—' },
  { label: 'Bathrooms', render: (p) => p.bathrooms || '—' },
  { label: 'Area', render: (p) => formatArea(p.area) },
  {
    label: 'Price / sqft',
    render: (p) => (p.area > 0 && p.status === 'for-sale' ? formatPrice(Math.round(p.price / p.area)) : '—'),
  },
  { label: 'Year Built', render: (p) => p.yearBuilt || '—' },
  { label: 'City', render: (p) => p.address?.city || '—' },
  { label: 'Amenities', render: (p) => (p.amenities?.length ? p.amenities.join(', ') : '—') },
  { label: 'Views', render: (p) => p.views ?? 0 },
];

export default function Compare() {
  usePageTitle('Compare Properties');
  const dispatch = useDispatch();
  const ids = useSelector(selectCompareIds);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) {
      setProperties([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .get('/properties', { params: { ids: ids.join(','), limit: ids.length } })
      .then(({ data }) => {
        if (!alive) return;
        // Preserve the order the user added them in
        const byId = Object.fromEntries(data.properties.map((p) => [p._id, p]));
        setProperties(ids.map((id) => byId[id]).filter(Boolean));
      })
      .catch(() => alive && setProperties([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ids]);

  if (loading) return <PageLoader />;

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold text-gray-900 dark:text-white">
            <Scale className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            Compare Properties
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Side-by-side comparison of up to 3 properties.
          </p>
        </div>
        {properties.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearCompare())}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Scale className="h-7 w-7 text-gray-400" />
          </span>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Nothing to compare yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Tap the scale icon on any property card to add it to the comparison.
          </p>
          <Link
            to="/properties"
            className="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[640px] border-collapse bg-white text-sm dark:bg-gray-900">
            <thead>
              <tr>
                <th className="w-36 border-b border-gray-200 p-4 dark:border-gray-800" />
                {properties.map((p) => (
                  <th key={p._id} className="border-b border-l border-gray-200 p-4 text-left align-top dark:border-gray-800">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCompare(p._id))}
                        aria-label={`Remove ${p.title} from comparison`}
                        className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-100 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Link to={`/properties/${p._id}`} className="group block">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                          )}
                        </div>
                        <p className="mt-2.5 font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                          {p.title}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/60 dark:bg-gray-800/30' : ''}>
                  <td className="p-4 font-medium text-gray-500 dark:text-gray-400">{row.label}</td>
                  {properties.map((p) => (
                    <td key={p._id} className="border-l border-gray-200 p-4 text-gray-900 dark:border-gray-800 dark:text-gray-100">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
