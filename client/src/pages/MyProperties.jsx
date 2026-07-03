import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Eye, Inbox, Mail, Pencil, Plus, Trash2 } from 'lucide-react';

import StatusBadge from '../components/property/StatusBadge';
import Button from '../components/ui/Button';
import api from '../lib/axios';
import { deleteProperty } from '../features/properties/propertyThunks';
import { formatPrice, timeAgo } from '../lib/format';

export default function MyProperties() {
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/properties/user/me'), api.get('/properties/inquiries/me')])
      .then(([props, inqs]) => {
        if (!alive) return;
        setProperties(props.data.properties);
        setInquiries(inqs.data.inquiries);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const handleDelete = async (property) => {
    if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
    setDeletingId(property._id);
    const result = await dispatch(deleteProperty(property._id));
    if (deleteProperty.fulfilled.match(result)) {
      setProperties((list) => list.filter((p) => p._id !== property._id));
      setInquiries((list) => list.filter((i) => i.property?._id !== property._id));
      toast.success('Listing deleted');
    } else {
      toast.error(result.payload || 'Could not delete the listing');
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="container-page animate-pulse py-10 lg:py-14">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Listings</h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Manage your properties and review buyer inquiries.
          </p>
        </div>
        <Link to="/properties/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Listings */}
      {properties.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Inbox className="h-7 w-7 text-gray-400" />
          </span>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">No listings yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Publish your first property to start receiving inquiries.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {properties.map((p) => (
            <div
              key={p._id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
            >
              <Link to={`/properties/${p._id}`} className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:w-28">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/properties/${p._id}`}
                    className="truncate font-semibold text-gray-900 transition hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                  >
                    {p.title}
                  </Link>
                  <StatusBadge status={p.status} className="px-2 py-0.5 text-[10px]" />
                </div>
                <p className="mt-1 text-sm font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(p.price, p.status)}
                </p>
                <p className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {p.views} views
                  </span>
                  <span>Listed {timeAgo(p.createdAt)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link to={`/properties/${p._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === p._id}
                  onClick={() => handleDelete(p)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiries */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          Inquiries ({inquiries.length})
        </h2>
        {inquiries.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No inquiries yet. They'll appear here when buyers contact you.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {inquiries.map((inq) => (
              <div key={inq._id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {inq.name}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {inq.email}
                      {inq.phone && ` · ${inq.phone}`}
                    </span>
                  </p>
                  <span className="text-xs text-gray-400">{timeAgo(inq.createdAt)}</span>
                </div>
                {inq.property && (
                  <Link
                    to={`/properties/${inq.property._id}`}
                    className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Re: {inq.property.title}
                  </Link>
                )}
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{inq.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
