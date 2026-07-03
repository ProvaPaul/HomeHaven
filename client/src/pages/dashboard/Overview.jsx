import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Bookmark, Eye, Heart, LayoutList, Mail, Plus, Search, UserCog } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import api from '../../lib/axios';
import { useChartTheme } from '../../lib/chartTheme';
import { STATUS_LABELS } from '../../lib/format';
import { selectUser } from '../../features/auth/authSlice';

const quickActions = [
  { to: '/properties/new', label: 'List a Property', icon: Plus },
  { to: '/properties', label: 'Browse Properties', icon: Search },
  { to: '/dashboard/settings', label: 'Edit Profile', icon: UserCog },
];

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export default function Overview() {
  const user = useSelector(selectUser);
  const chart = useChartTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/users/dashboard')
      .then(({ data }) => alive && setData(data))
      .catch((error) => toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <OverviewSkeleton />;
  if (!data) return null;

  const inquiriesSeries = data.inquiriesByDay.map((d) => ({
    ...d,
    label: d.date.slice(5).replace('-', '/'),
  }));
  const statusSeries = data.listingsByStatus.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: chart.colorForStatus(s.status),
  }));
  const topListings = data.topListings.map((l) => ({
    name: l.title.length > 22 ? `${l.title.slice(0, 22)}…` : l.title,
    views: l.views,
  }));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your properties."
        action={
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <a.icon className="h-4 w-4" />
                {a.label}
              </Link>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LayoutList} label="My Listings" value={data.stats.listings} />
        <StatCard icon={Eye} label="Total Views" value={data.stats.totalViews} hint="Across all your listings" />
        <StatCard icon={Mail} label="Inquiries" value={data.stats.inquiries} hint="From interested buyers" />
        <StatCard icon={Heart} label="Favorites" value={data.stats.favorites} hint={`${data.stats.savedSearches} saved searches`} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Inquiries" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inquiriesSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chart.tick, fontSize: 11 }}
                axisLine={{ stroke: chart.axis }}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: chart.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={chart.tooltip} cursor={{ stroke: chart.axis }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Inquiries"
                stroke={chart.primary}
                strokeWidth={2}
                fill={chart.primaryFill}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Listings by Status" subtitle="Your current portfolio">
          {statusSeries.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No listings yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  strokeWidth={0}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusSeries.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chart.tooltip} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: chart.tick, fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top listings by views */}
      <div className="mt-6">
        <ChartCard title="Most Viewed Listings" subtitle="Top 5 by total views" height={Math.max(180, topListings.length * 52)}>
          {topListings.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No listings yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topListings} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  tick={{ fill: chart.tick, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chart.tooltip} cursor={{ fill: chart.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                <Bar
                  dataKey="views"
                  name="Views"
                  fill={chart.primary}
                  radius={[0, 6, 6, 0]}
                  barSize={22}
                  label={{ position: 'right', fill: chart.tick, fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/saved-searches"
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Bookmark className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Saved Searches</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.stats.savedSearches} saved — jump back into your search</p>
          </div>
        </Link>
        <Link
          to="/dashboard/favorites"
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-500/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">My Wishlist</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.stats.favorites} favorite properties</p>
          </div>
        </Link>
      </div>
    </>
  );
}
