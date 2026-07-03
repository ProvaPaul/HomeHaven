import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  MapPin,
  Ruler,
  User,
} from 'lucide-react';

import Gallery from '../components/property/Gallery';
import StatusBadge from '../components/property/StatusBadge';
import FavoriteButton from '../components/property/FavoriteButton';
import CompareButton from '../components/property/CompareButton';
import ShareButton from '../components/property/ShareButton';
import ContactSellerForm from '../components/property/ContactSellerForm';
import PropertyGrid from '../components/property/PropertyGrid';
import RecentlyViewed from '../components/property/RecentlyViewed';
import NotFound from './NotFound';
import api from '../lib/axios';
import { recordView } from '../lib/recentlyViewed';
import { formatPrice, formatArea, TYPE_LABELS } from '../lib/format';
import { fetchProperty } from '../features/properties/propertyThunks';
import { selectCurrentProperty, clearCurrentProperty } from '../features/properties/propertiesSlice';

function DetailsSkeleton() {
  return (
    <div className="container-page animate-pulse py-10">
      <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="aspect-[16/10] rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { property, status, error } = useSelector(selectCurrentProperty);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    dispatch(fetchProperty(id));
    return () => dispatch(clearCurrentProperty());
  }, [dispatch, id]);

  useEffect(() => {
    if (property) {
      recordView(property);
      let alive = true;
      api
        .get(`/properties/${property._id}/similar`)
        .then(({ data }) => alive && setSimilar(data.properties))
        .catch(() => {});
      return () => {
        alive = false;
      };
    }
  }, [property]);

  if (status === 'loading' || status === 'idle') return <DetailsSkeleton />;
  if (status === 'failed') {
    if (/not found|invalid/i.test(error || '')) return <NotFound />;
    return (
      <div className="container-page py-24 text-center text-gray-600 dark:text-gray-400">
        Could not load this property. Please try again.
      </div>
    );
  }
  if (!property) return null;

  const { address, owner } = property;
  const fullAddress = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const facts = [
    property.bedrooms > 0 && { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
    property.bathrooms > 0 && { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
    { icon: Ruler, label: 'Area', value: formatArea(property.area) },
    { icon: Building2, label: 'Type', value: TYPE_LABELS[property.type] || property.type },
    property.yearBuilt && { icon: CalendarDays, label: 'Year Built', value: property.yearBuilt },
    { icon: Eye, label: 'Views', value: property.views },
  ].filter(Boolean);

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="transition hover:text-primary-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/properties" className="transition hover:text-primary-600">Properties</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-gray-900 dark:text-white">{property.title}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 grid gap-8 lg:grid-cols-3"
      >
        {/* Left column */}
        <div className="lg:col-span-2">
          <Gallery images={property.images} title={property.title} />

          {/* Title row */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={property.status} />
                {property.featured && (
                  <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">Featured</span>
                )}
                {property.verification === 'approved' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                {fullAddress}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton propertyId={property._id} className="border border-gray-200 dark:border-gray-700" />
              <CompareButton propertyId={property._id} className="border border-gray-200 dark:border-gray-700" />
              <ShareButton title={property.title} />
            </div>
          </div>

          {/* Key facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <fact.icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{fact.label}</p>
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">About this property</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-400">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Amenities</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
            <p className="mt-1 text-3xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(property.price, property.status)}
            </p>
            {property.area > 0 && property.status === 'for-sale' && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatPrice(Math.round(property.price / property.area))} per sqft
              </p>
            )}
          </div>

          {/* Seller card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-lg font-bold text-white">
                {owner?.avatar ? (
                  <img src={owner.avatar} alt={owner.name} className="h-full w-full object-cover" />
                ) : (
                  owner?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
                )}
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{owner?.name || 'Property Owner'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Listed by seller</p>
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
              <ContactSellerForm propertyId={property._id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Similar Properties</h2>
          <div className="mt-6">
            <PropertyGrid properties={similar} skeletonCount={3} />
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={property._id} className="mt-14" />
    </div>
  );
}
