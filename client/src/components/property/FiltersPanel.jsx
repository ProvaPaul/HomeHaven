import { useEffect, useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { STATUS_LABELS, TYPE_LABELS } from '../../lib/format';

const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const countOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }));

const EMPTY = {
  type: '',
  status: '',
  city: '',
  minPrice: '',
  maxPrice: '',
  beds: '',
  baths: '',
};

// Controlled by URL params from the parent; applies on submit for fewer refetches
export default function FiltersPanel({ values, onApply, onReset }) {
  const [draft, setDraft] = useState({ ...EMPTY, ...values });

  useEffect(() => {
    setDraft({ ...EMPTY, ...values });
  }, [values]);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(draft);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-primary-600 dark:text-gray-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <Select label="Property Type" name="type" placeholder="Any type" options={typeOptions} value={draft.type} onChange={set('type')} />
        <Select label="Status" name="status" placeholder="Any status" options={statusOptions} value={draft.status} onChange={set('status')} />
        <Input label="City" name="city" placeholder="e.g. Austin" value={draft.city} onChange={set('city')} />

        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</p>
          <div className="grid grid-cols-2 gap-3">
            <Input name="minPrice" type="number" min="0" placeholder="Min" aria-label="Minimum price" value={draft.minPrice} onChange={set('minPrice')} />
            <Input name="maxPrice" type="number" min="0" placeholder="Max" aria-label="Maximum price" value={draft.maxPrice} onChange={set('maxPrice')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Bedrooms" name="beds" placeholder="Any" options={countOptions} value={draft.beds} onChange={set('beds')} />
          <Select label="Bathrooms" name="baths" placeholder="Any" options={countOptions} value={draft.baths} onChange={set('baths')} />
        </div>

        <Button type="submit" className="w-full">
          Apply Filters
        </Button>
      </div>
    </form>
  );
}
