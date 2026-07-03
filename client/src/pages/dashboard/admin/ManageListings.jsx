import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, Search, Star, Trash2, X } from 'lucide-react';

import PageHeader from '../../../components/dashboard/PageHeader';
import DataTable from '../../../components/dashboard/DataTable';
import Pagination from '../../../components/common/Pagination';
import StatusBadge from '../../../components/property/StatusBadge';
import api from '../../../lib/axios';
import { formatPrice, timeAgo } from '../../../lib/format';
import { cn } from '../../../lib/utils';

const VERIFICATION_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const verificationStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export default function ManageListings() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [verification, setVerification] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/properties', { params });
      setProperties(data.properties);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ q, verification, page });
  }, [load, q, verification, page]);

  const patchRow = (id, patch) =>
    setProperties((list) => list.map((p) => (p._id === id ? { ...p, ...patch } : p)));

  const handleVerify = async (property, action) => {
    try {
      await api.put(`/admin/properties/${property._id}/verify`, { action });
      patchRow(property._id, { verification: action });
      toast.success(`"${property.title}" ${action}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFeature = async (property) => {
    try {
      const { data } = await api.put(`/admin/properties/${property._id}/feature`);
      patchRow(property._id, { featured: data.property.featured });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (property) => {
    if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/properties/${property._id}`);
      setProperties((list) => list.filter((p) => p._id !== property._id));
      setTotal((t) => t - 1);
      toast.success('Listing deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Listings"
        subtitle={`${total} listing${total === 1 ? '' : 's'} — review, verify, and feature properties`}
      />

      {/* Verification tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VERIFICATION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setVerification(tab.value);
              setPage(1);
            }}
            className={cn(
              'rounded-lg px-3.5 py-2 text-sm font-medium transition',
              verification === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search title or city…"
            aria-label="Search listings"
            className="input-field pl-10"
          />
        </div>
      </div>

      <DataTable
        isLoading={loading}
        rows={properties}
        emptyMessage="No listings match this filter"
        columns={[
          {
            key: 'title',
            header: 'Property',
            render: (p) => (
              <div className="flex items-center gap-3">
                <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                </span>
                <div className="min-w-0">
                  <Link
                    to={`/properties/${p._id}`}
                    className="block truncate font-medium text-gray-900 hover:text-primary-600 dark:text-white"
                  >
                    {p.title}
                    {p.featured && <Star className="ml-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </Link>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {p.owner?.name} · {p.address?.city} · {timeAgo(p.createdAt)}
                  </p>
                </div>
              </div>
            ),
          },
          { key: 'price', header: 'Price', render: (p) => formatPrice(p.price, p.status) },
          { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} className="px-2 py-0.5 text-[10px]" /> },
          {
            key: 'verification',
            header: 'Verification',
            render: (p) => (
              <span className={cn('rounded-md px-2 py-1 text-xs font-semibold capitalize', verificationStyles[p.verification])}>
                {p.verification}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (p) => (
              <div className="flex items-center gap-1">
                {p.verification !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(p, 'approved')}
                    title="Approve"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {p.verification !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(p, 'rejected')}
                    title="Reject"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFeature(p)}
                  title={p.featured ? 'Unfeature' : 'Feature'}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-50 dark:hover:bg-amber-500/10',
                    p.featured ? 'text-amber-500' : 'text-gray-400'
                  )}
                >
                  <Star className={cn('h-4 w-4', p.featured && 'fill-current')} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  title="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Pagination page={page} pages={pages} onChange={setPage} />

      <p className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <BadgeCheck className="h-4 w-4" />
        Approved listings show a "Verified" badge. Rejected listings are hidden from public search, and owners are
        notified of both outcomes.
      </p>
    </>
  );
}
