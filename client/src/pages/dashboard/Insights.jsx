import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, Eye, Flame, Lightbulb, Mail, Sparkles, TrendingUp } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import EmptyState from '../../components/dashboard/EmptyState';
import api from '../../lib/axios';

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/ai/seller-insights')
      .then(({ data }) => alive && setData(data))
      .catch((error) => toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!data?.hasListings) {
    return (
      <>
        <PageHeader title="AI Insights" subtitle="Performance analysis for your listings." />
        <EmptyState
          icon={Sparkles}
          title="No insights yet"
          message="List your first property and AI insights will analyze its performance here."
          actionTo="/properties/new"
          actionLabel="List a Property"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="AI Insights"
        subtitle="AI-generated analysis of how your listings are performing."
      />

      {data.narrative && (
        <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-500/25 dark:bg-primary-500/5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300">
            <Sparkles className="h-4 w-4" />
            Your AI Coach
          </p>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">{data.narrative}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Eye} label="Total Views" value={data.stats.totalViews} hint={`~${data.stats.avgViewsPerListing} per listing`} />
        <StatCard icon={Mail} label="Total Inquiries" value={data.stats.totalInquiries} />
        <StatCard
          icon={Flame}
          label="Most Viewed"
          value={data.mostViewed.views}
          hint={data.mostViewed.title}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Best posting time */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <CalendarClock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Best Posting Time
          </h3>
          {data.bestPostingTime ? (
            <>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {data.bestPostingTime.day}s, {data.bestPostingTime.window}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {data.bestPostingTime.note}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Not enough inquiry data yet — once you've received a few inquiries, we'll detect when buyers
              are most active and suggest the best time to post.
            </p>
          )}
        </div>

        {/* Trending listing */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Momentum
          </h3>
          {data.trending ? (
            <>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Gaining attention fastest:</p>
              <Link
                to={`/properties/${data.trending.propertyId}`}
                className="mt-1 block text-lg font-bold text-primary-600 hover:underline dark:text-primary-400"
              >
                {data.trending.title}
              </Link>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ~{data.trending.viewsPerDay} views per day since listing
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Your most-viewed listing is also your fastest-growing one. Adding fresh photos can restart
              momentum on older listings.
            </p>
          )}
        </div>
      </div>

      {/* Improvement tips */}
      <div className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Listing Improvements
        </h3>
        {data.tips.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/5 dark:text-emerald-300">
            🎉 All your listings look great — good photos, detailed descriptions, and market-aligned pricing.
          </div>
        ) : (
          <div className="space-y-3">
            {data.tips.map((tip) => (
              <div key={tip.propertyId} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{tip.title}</p>
                  <Link
                    to={`/properties/${tip.propertyId}/edit`}
                    className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Edit listing →
                  </Link>
                </div>
                <ul className="mt-2 space-y-1">
                  {tip.issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {issue.charAt(0).toUpperCase() + issue.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
