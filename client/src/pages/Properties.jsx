import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Bookmark, Search, SlidersHorizontal, X } from 'lucide-react';

import PropertyGrid from '../components/property/PropertyGrid';
import FiltersPanel from '../components/property/FiltersPanel';
import SmartSearchBar from '../components/ai/SmartSearchBar';
import Pagination from '../components/common/Pagination';
import Select from '../components/ui/Select';
import api from '../lib/axios';
import { STATUS_LABELS, TYPE_LABELS } from '../lib/format';
import { fetchProperties } from '../features/properties/propertyThunks';
import { selectPropertyList } from '../features/properties/propertiesSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { usePageTitle } from '../hooks/usePageTitle';

const FILTER_KEYS = ['q', 'type', 'status', 'city', 'minPrice', 'maxPrice', 'beds', 'baths', 'sort', 'page'];

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
];

export default function Properties() {
  usePageTitle('Browse Properties', 'Search thousands of verified homes, apartments, and villas for sale or rent.');
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, page, pages, status } = useSelector(selectPropertyList);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '');

  const params = useMemo(() => {
    const obj = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchProperties({ limit: 9, ...params }));
  }, [dispatch, params]);

  useEffect(() => {
    setSearchDraft(searchParams.get('q') || '');
  }, [searchParams]);

  const updateParams = (updates, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
    setMobileFilters(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchDraft.trim() });
  };

  const activeFilterCount = ['type', 'status', 'city', 'minPrice', 'maxPrice', 'beds', 'baths'].filter(
    (k) => params[k]
  ).length;

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const hasCriteria = activeFilterCount > 0 || Boolean(params.q);

  const handleSaveSearch = async () => {
    if (!isAuthenticated) {
      toast('Log in to save searches', { icon: '🔒' });
      navigate('/login');
      return;
    }
    // Build a readable default name from the active criteria
    const parts = [];
    if (params.type) parts.push(TYPE_LABELS[params.type] || params.type);
    if (params.status) parts.push(STATUS_LABELS[params.status] || params.status);
    if (params.city) parts.push(`in ${params.city}`);
    if (params.q) parts.push(`"${params.q}"`);
    const name = parts.length ? parts.join(' ') : 'All properties';

    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'page'))
    ).toString();

    try {
      await api.post('/users/saved-searches', { name, query });
      toast.success(`Search saved as "${name}"`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Properties</h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            {status === 'succeeded' ? `${total} propert${total === 1 ? 'y' : 'ies'} available` : 'Loading properties…'}
          </p>
        </div>
        {hasCriteria && (
          <button
            type="button"
            onClick={handleSaveSearch}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:text-gray-200"
          >
            <Bookmark className="h-4 w-4" />
            Save this search
          </button>
        )}
      </div>

      {/* AI natural-language search */}
      <div className="mt-6">
        <SmartSearchBar
          onFilters={(filters) =>
            updateParams({
              q: filters.q || '',
              type: filters.type || '',
              status: filters.status || '',
              city: filters.city || '',
              minPrice: filters.minPrice ? String(filters.minPrice) : '',
              maxPrice: filters.maxPrice ? String(filters.maxPrice) : '',
              beds: filters.beds ? String(filters.beds) : '',
              baths: filters.baths ? String(filters.baths) : '',
            })
          }
        />
      </div>

      {/* Search + sort bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search by title, description, or city…"
            aria-label="Search properties"
            className="input-field pl-10"
          />
        </form>
        <div className="flex gap-3">
          <Select
            name="sort"
            aria-label="Sort properties"
            options={sortOptions}
            value={params.sort || 'newest'}
            onChange={(e) => updateParams({ sort: e.target.value }, { resetPage: false })}
            className="w-48"
          />
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="relative flex h-[42px] items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FiltersPanel
              values={params}
              onApply={(draft) => updateParams(draft)}
              onReset={() => updateParams({ type: '', status: '', city: '', minPrice: '', maxPrice: '', beds: '', baths: '' })}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          <PropertyGrid
            properties={items}
            isLoading={status === 'loading' || status === 'idle'}
            skeletonCount={9}
            emptyTitle="No properties match your search"
            emptyMessage="Try different keywords or remove some filters."
          />
          {status === 'failed' && (
            <p className="mt-6 text-center text-sm text-red-600 dark:text-red-400">
              Could not load properties. Please try again.
            </p>
          )}
          <Pagination page={page} pages={pages} onChange={(p) => updateParams({ page: String(p) }, { resetPage: false })} />
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-gray-50 p-4 shadow-xl dark:bg-gray-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel
              values={params}
              onApply={(draft) => updateParams(draft)}
              onReset={() => updateParams({ type: '', status: '', city: '', minPrice: '', maxPrice: '', beds: '', baths: '' })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
