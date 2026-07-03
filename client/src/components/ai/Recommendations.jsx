import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

import PropertyGrid from '../property/PropertyGrid';
import api from '../../lib/axios';
import { getRecentlyViewed } from '../../lib/recentlyViewed';

export default function Recommendations({ className = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const viewedIds = getRecentlyViewed().map((p) => p._id);
    api
      .post('/ai/recommendations', { viewedIds, limit: 6 })
      .then(({ data }) => alive && setData(data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && !data?.properties?.length) return null;

  return (
    <section className={className}>
      <div className="container-page py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-3xl font-bold text-gray-900 dark:text-white">
              <Sparkles className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              {data?.basis === 'profile' ? 'Recommended for You' : 'Popular Right Now'}
            </h2>
            {data?.reason && <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">{data.reason}</p>}
          </div>
        </div>
        <div className="mt-8">
          <PropertyGrid properties={data?.properties || []} isLoading={loading} skeletonCount={3} />
        </div>
      </div>
    </section>
  );
}
