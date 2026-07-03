import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Bookmark, Trash2 } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/dashboard/EmptyState';
import api from '../../lib/axios';
import { STATUS_LABELS, TYPE_LABELS } from '../../lib/format';
import { timeAgo } from '../../lib/format';

// Turn a stored query string into readable filter chips
const describeQuery = (query) => {
  const params = new URLSearchParams(query);
  const chips = [];
  if (params.get('q')) chips.push(`"${params.get('q')}"`);
  if (params.get('type')) chips.push(TYPE_LABELS[params.get('type')] || params.get('type'));
  if (params.get('status')) chips.push(STATUS_LABELS[params.get('status')] || params.get('status'));
  if (params.get('city')) chips.push(params.get('city'));
  if (params.get('minPrice')) chips.push(`min $${Number(params.get('minPrice')).toLocaleString()}`);
  if (params.get('maxPrice')) chips.push(`max $${Number(params.get('maxPrice')).toLocaleString()}`);
  if (params.get('beds')) chips.push(`${params.get('beds')}+ beds`);
  if (params.get('baths')) chips.push(`${params.get('baths')}+ baths`);
  return chips.length ? chips : ['All properties'];
};

export default function SavedSearches() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/users/saved-searches')
      .then(({ data }) => alive && setSearches(data.savedSearches))
      .catch((error) => toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/users/saved-searches/${id}`);
      setSearches(data.savedSearches);
      toast.success('Saved search removed');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Saved Searches"
        subtitle="Jump back into searches you saved from the Properties page."
      />

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved searches yet"
          message='Set filters on the Properties page and press "Save search" to store them here.'
          actionTo="/properties"
          actionLabel="Start Searching"
        />
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <div
              key={s._id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {describeQuery(s.query).map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">Saved {timeAgo(s.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/properties?${s.query}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Run search
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(s._id)}
                  aria-label={`Delete saved search ${s.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
