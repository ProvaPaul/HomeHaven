import { useState } from 'react';
import { MapPinned, Plus, X } from 'lucide-react';

import Input from '../ui/Input';
import Button from '../ui/Button';
import { useCommuteDestinations } from '../../hooks/useCommuteDestinations';

/**
 * Lets a buyer save named destinations (Office, University, or any address)
 * and pick which one is "active" for commute badges/filter/sort on the
 * Properties list. Destinations persist across pages via localStorage.
 *
 * @param {{ activeId: string, onActiveChange: (id:string) => void }} props
 */
export default function CommuteSearchBar({ activeId, onActiveChange }) {
  const { destinations, addDestination, remove, isAdding, error } = useCommuteDestinations();
  const [expanded, setExpanded] = useState(destinations.length === 0);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await addDestination(label, address);
    if (ok) {
      setLabel('');
      setAddress('');
      setExpanded(false);
    }
  };

  const handleRemove = (id) => {
    remove(id);
    if (activeId === id) onActiveChange('');
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <MapPinned className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          Commute-Time Search
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Add destination
        </button>
      </div>

      {destinations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onActiveChange('')}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !activeId
                ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-500/10 dark:text-primary-400'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            Off
          </button>
          {destinations.map((d) => (
            <span
              key={d.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeId === d.id
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              <button type="button" onClick={() => onActiveChange(d.id)}>
                {d.label}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(d.id)}
                aria-label={`Remove ${d.label}`}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-[1fr,2fr,auto]">
          <Input
            placeholder="Label (e.g. Office)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            aria-label="Destination label"
          />
          <Input
            placeholder="Address (e.g. Google Bangladesh, Dhaka)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Destination address"
          />
          <Button type="submit" isLoading={isAdding} className="whitespace-nowrap">
            Save
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
