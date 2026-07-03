import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ImagePlus, Link as LinkIcon, Loader2, Plus, Trash2, X } from 'lucide-react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { propertySchema } from '../../lib/validations';
import { uploadPropertyImages } from '../../lib/uploadImages';
import { isFirebaseConfigured } from '../../lib/firebase';
import { STATUS_LABELS, TYPE_LABELS } from '../../lib/format';
import { cn } from '../../lib/utils';

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const AMENITY_SUGGESTIONS = [
  'Garage', 'Garden', 'Pool', 'Gym', 'Balcony', 'Fireplace', 'Air Conditioning',
  'Heating', 'Parking', 'Security', 'Elevator', 'Pet Friendly', 'Smart Home', 'Laundry',
];

const MAX_IMAGES = 12;

const toFormValues = (property) => ({
  title: property?.title || '',
  description: property?.description || '',
  type: property?.type || '',
  status: property?.status || 'for-sale',
  price: property?.price ?? '',
  bedrooms: property?.bedrooms ?? 0,
  bathrooms: property?.bathrooms ?? 0,
  area: property?.area ?? '',
  yearBuilt: property?.yearBuilt ?? '',
  street: property?.address?.street || '',
  city: property?.address?.city || '',
  state: property?.address?.state || '',
  zipCode: property?.address?.zipCode || '',
});

export default function PropertyForm({ property, onSubmit, submitLabel = 'Publish Listing' }) {
  const [images, setImages] = useState(property?.images || []);
  const [amenities, setAmenities] = useState(property?.amenities || []);
  const [amenityDraft, setAmenityDraft] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: toFormValues(property),
  });

  const addAmenity = (value) => {
    const clean = value.trim();
    if (!clean) return;
    if (amenities.some((a) => a.toLowerCase() === clean.toLowerCase())) return;
    setAmenities((list) => [...list, clean]);
    setAmenityDraft('');
  };

  const addImageUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      toast.error('Enter a valid image URL (must start with http)');
      return;
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images`);
      return;
    }
    setImages((list) => [...list, url]);
    setUrlDraft('');
  };

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images`);
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadPropertyImages(files);
      setImages((list) => [...list, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = (data) => {
    if (!images.length) {
      toast.error('Add at least one image');
      return;
    }
    const payload = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      ...(data.yearBuilt ? { yearBuilt: data.yearBuilt } : {}),
      address: {
        street: data.street || '',
        city: data.city,
        state: data.state || '',
        zipCode: data.zipCode || '',
      },
      amenities,
      images,
    };
    return onSubmit(payload);
  };

  const sectionClass =
    'rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8';

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      {/* Basics */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
        <div className="mt-5 space-y-5">
          <Input label="Title" name="title" placeholder="e.g. Modern Family House with Garden" error={errors.title?.message} {...register('title')} />
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Describe the property, its highlights, and the neighborhood…"
              className={cn('input-field resize-none', errors.description && 'input-error')}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Property Type" name="type" placeholder="Select type" options={typeOptions} error={errors.type?.message} {...register('type')} />
            <Select label="Status" name="status" options={statusOptions} error={errors.status?.message} {...register('status')} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Price (USD)" name="price" type="number" min="0" step="any" placeholder="450000" error={errors.price?.message} {...register('price')} />
          <Input label="Area (sqft)" name="area" type="number" min="0" step="any" placeholder="1800" error={errors.area?.message} {...register('area')} />
          <Input label="Year Built (optional)" name="yearBuilt" type="number" placeholder="2015" error={errors.yearBuilt?.message} {...register('yearBuilt')} />
          <Input label="Bedrooms" name="bedrooms" type="number" min="0" error={errors.bedrooms?.message} {...register('bedrooms')} />
          <Input label="Bathrooms" name="bathrooms" type="number" min="0" error={errors.bathrooms?.message} {...register('bathrooms')} />
        </div>
      </div>

      {/* Location */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Input label="Street (optional)" name="street" placeholder="42 Maple Grove" error={errors.street?.message} {...register('street')} className="sm:col-span-2" />
          <Input label="City" name="city" placeholder="Austin" error={errors.city?.message} {...register('city')} />
          <Input label="State (optional)" name="state" placeholder="TX" error={errors.state?.message} {...register('state')} />
          <Input label="ZIP Code (optional)" name="zipCode" placeholder="78701" error={errors.zipCode?.message} {...register('zipCode')} />
        </div>
      </div>

      {/* Amenities */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Amenities</h2>
        {amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => setAmenities((list) => list.filter((a) => a !== amenity))}
                  aria-label={`Remove ${amenity}`}
                  className="transition hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <input
            value={amenityDraft}
            onChange={(e) => setAmenityDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity(amenityDraft);
              }
            }}
            placeholder="Add an amenity and press Enter"
            aria-label="Add amenity"
            className="input-field flex-1"
          />
          <Button type="button" variant="secondary" onClick={() => addAmenity(amenityDraft)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AMENITY_SUGGESTIONS.filter((s) => !amenities.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addAmenity(s)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:text-gray-400"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Photos</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{images.length}/{MAX_IMAGES}</span>
        </div>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img src={src} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((list) => list.filter((_, idx) => idx !== i))}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {isFirebaseConfigured ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="image-upload" />
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center transition hover:border-primary-400 dark:border-gray-700"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                )}
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploading ? 'Uploading…' : 'Click to upload images'}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">PNG or JPG, up to 5MB each</p>
              </label>
            </>
          ) : (
            <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              Firebase Storage is not configured, so direct uploads are disabled. Paste image URLs below — or add
              Firebase keys to <code>client/.env</code> to enable uploads.
            </p>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="Or paste an image URL"
                aria-label="Image URL"
                className="input-field pl-9"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addImageUrl}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" isLoading={isSubmitting || uploading} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
