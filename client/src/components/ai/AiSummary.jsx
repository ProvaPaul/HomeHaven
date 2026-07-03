import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

import api from '../../lib/axios';

export default function AiSummary({ propertyId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    api
      .get(`/ai/summary/${propertyId}`)
      .then(({ data }) => alive && setData(data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [propertyId]);

  if (!data) return null;

  return (
    <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-500/25 dark:bg-primary-500/5">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300">
        <Sparkles className="h-4 w-4" />
        AI Summary
      </p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{data.summary}</p>
      {data.highlights?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300"
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
