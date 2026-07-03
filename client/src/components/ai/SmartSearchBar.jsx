import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';

import api from '../../lib/axios';

const EXAMPLES = [
  'Apartments for rent under $4k in Seattle',
  '4-bedroom houses between 500k and 2m',
  'Villas with a pool',
];

/**
 * Natural-language search box. Sends the query to /ai/search and hands the
 * parsed filters back to the parent (which applies them to the URL).
 */
export default function SmartSearchBar({ onFilters }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const runSearch = async (text) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post('/ai/search', { query: text.trim() });
      onFilters(data.filters);
      toast.success(data.explanation, { icon: '✨', duration: 4000 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-white p-4 dark:border-primary-500/25 dark:from-primary-500/10 dark:to-gray-900">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300">
        <Sparkles className="h-4 w-4" />
        AI Smart Search
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mt-2.5 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Describe what you want — e.g. "3 bed house in Austin under 800k"'
          aria-label="AI smart search"
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Search
        </button>
      </form>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              runSearch(example);
            }}
            className="rounded-full border border-primary-200 px-2.5 py-1 text-xs text-primary-700 transition hover:bg-primary-100 dark:border-primary-500/30 dark:text-primary-300 dark:hover:bg-primary-500/10"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
