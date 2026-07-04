import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Bath, BedDouble, MapPin, Ruler, Star } from 'lucide-react';

import StatusBadge from './StatusBadge';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';
import CommuteBadge from './CommuteBadge';
import { formatPrice, formatArea, TYPE_LABELS } from '../../lib/format';

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e5e7eb"/><path d="M200 100l-60 48h18v52h30v-32h24v32h30v-52h18l-60-48z" fill="%239ca3af"/></svg>';

function PropertyCard({ property, commute, isCommuteLoading }) {
  const {
    _id,
    title,
    price,
    status,
    type,
    bedrooms,
    bathrooms,
    area,
    images,
    address,
    featured,
    verification,
  } = property;

  return (
    <Link
      to={`/properties/${_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={images?.[0] || FALLBACK_IMAGE}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={status} />
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <FavoriteButton propertyId={_id} />
          <CompareButton propertyId={_id} />
        </div>
        {(commute || isCommuteLoading) && (
          <div className="absolute bottom-3 left-3">
            <CommuteBadge commute={commute} isLoading={isCommuteLoading} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(price, status)}
          </p>
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {TYPE_LABELS[type] || type}
          </span>
        </div>

        <h3 className="mt-1.5 flex items-center gap-1.5 font-semibold text-gray-900 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
          <span className="line-clamp-1">{title}</span>
          {verification === 'approved' && (
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
              aria-label="Verified listing"
            />
          )}
        </h3>

        <p className="mb-4 mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {[address?.city, address?.state].filter(Boolean).join(', ')}
          </span>
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-3.5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
          {bedrooms > 0 && (
            <span>
              <BedDouble className="h-4 w-4 text-gray-400" />
              {bedrooms}
            </span>
          )}
          {bathrooms > 0 && (
            <span>
              <Bath className="h-4 w-4 text-gray-400" />
              {bathrooms}
            </span>
          )}
          <span>
            <Ruler className="h-4 w-4 text-gray-400" />
            {formatArea(area)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(PropertyCard);
