import { useState } from 'react';
import toast from 'react-hot-toast';
import { Calculator, Loader2, Sparkles } from 'lucide-react';

import api from '../../lib/axios';
import { formatPrice } from '../../lib/format';

/**
 * Inline market-value estimator for the property form.
 * getDraft() must return { type, city, area, bedrooms, bathrooms, status, yearBuilt }.
 */
export default function PriceEstimator({ getDraft, onUsePrice }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    const draft = getDraft();
    if (!draft.type || !draft.area) {
      toast.error('Fill in the property type and area first');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/estimate-price', draft);
      if (!data.available) {
        toast(data.message, { icon: 'ℹ️' });
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50/50 p-4 dark:border-primary-500/30 dark:bg-primary-500/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300">
          <Calculator className="h-4 w-4" />
          AI Price Estimator
        </p>
        <button
          type="button"
          onClick={estimate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Estimate market value
        </button>
      </div>

      {result && (
        <div className="mt-3 rounded-lg bg-white p-3.5 dark:bg-gray-900">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(result.estimate)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              range {formatPrice(result.low)} – {formatPrice(result.high)}
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ~{formatPrice(result.perSqft)}/sqft · {result.note} · confidence: {result.confidence}
          </p>
          <button
            type="button"
            onClick={() => onUsePrice(result.estimate)}
            className="mt-2.5 rounded-lg border border-primary-300 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:border-primary-500/40 dark:text-primary-300 dark:hover:bg-primary-500/10"
          >
            Use this price
          </button>
        </div>
      )}
    </div>
  );
}
