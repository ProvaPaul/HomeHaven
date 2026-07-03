import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, Building2, Eye, Mail, Users } from 'lucide-react';
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

import PageHeader from '../../../components/dashboard/PageHeader';
import StatCard from '../../../components/dashboard/StatCard';
import ChartCard from '../../../components/dashboard/ChartCard';
import DataTable from '../../../components/dashboard/DataTable';
import StatusBadge from '../../../components/property/StatusBadge';
import api from '../../../lib/axios';
import { useChartTheme } from '../../../lib/chartTheme';
import { STATUS_LABELS, TYPE_LABELS, formatPrice, timeAgo } from '../../../lib/format';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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

export default function AdminOverview() {
  const chart = useChartTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/admin/stats')
      .then(({ data }) => alive && setData(data))
      .catch((error) => toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <AdminSkeleton />;
  if (!data) return null;

  const usersSeries = data.usersByMonth.map((m) => ({
    ...m,
    label: MONTH_NAMES[Number(m.month.slice(5)) - 1],
  }));
  const typeSeries = data.listingsByType.map((t) => ({
    name: TYPE_LABELS[t.type] || t.type,
    count: t.count,
    color: chart.colorForType(t.type),
  }));
  const statusSeries = data.listingsByStatus.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: chart.colorForStatus(s.status),
  }));

  return (
    <>
      <PageHeader title="Platform Analytics" subtitle="A live overview of everything on HomeHaven." />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Total Users" value={data.totals.users} />
        <StatCard icon={Building2} label="Listings" value={data.totals.properties} />
        <StatCard icon={Mail} label="Inquiries" value={data.totals.inquiries} />
        <StatCard icon={Eye} label="Total Views" value={data.totals.views} />
        <StatCard
          icon={BadgeCheck}
          label="Pending Review"
          value={data.totals.pendingVerification}
          hint={data.totals.pendingVerification > 0 ? 'Awaiting verification' : 'All caught up'}
          className={data.totals.pendingVerification > 0 ? 'border-amber-300 dark:border-amber-500/40' : ''}
        />
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="New Users" subtitle="Sign-ups per month, last 6 months">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usersSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={{ stroke: chart.axis }} tickLine={false} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chart.tooltip} cursor={{ stroke: chart.axis }} />
              <Area
                type="monotone"
                dataKey="count"
                name="New users"
                stroke={chart.primary}
                strokeWidth={2}
                fill={chart.primaryFill}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Listings by Status" subtitle="Current marketplace mix">
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
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Listings by Type" subtitle="Where the inventory is">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeSeries} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={{ stroke: chart.axis }} tickLine={false} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chart.tooltip} cursor={{ fill: chart.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="count" name="Listings" radius={[6, 6, 0, 0]} barSize={36} label={{ position: 'top', fill: chart.tick, fontSize: 12 }}>
                {typeSeries.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Cities" subtitle="Most listed locations" height={280}>
          <div className="h-full overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="py-2">City</th>
                  <th className="py-2 text-right">Listings</th>
                  <th className="py-2 text-right">Avg. Price</th>
                </tr>
              </thead>
              <tbody>
                {data.topCities.map((c) => (
                  <tr key={c.city} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-2.5 font-medium text-gray-900 dark:text-white">{c.city}</td>
                    <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{c.count}</td>
                    <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{formatPrice(c.avgPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Recents */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Newest Users</h3>
            <Link to="/dashboard/admin/users" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              Manage users →
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'role', header: 'Role', render: (u) => <span className="capitalize">{u.role}</span> },
              { key: 'createdAt', header: 'Joined', render: (u) => timeAgo(u.createdAt) },
            ]}
            rows={data.recentUsers}
          />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Newest Listings</h3>
            <Link to="/dashboard/admin/listings" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              Manage listings →
            </Link>
          </div>
          <DataTable
            columns={[
              {
                key: 'title',
                header: 'Property',
                render: (p) => (
                  <Link to={`/properties/${p._id}`} className="font-medium text-gray-900 hover:text-primary-600 dark:text-white">
                    {p.title.length > 28 ? `${p.title.slice(0, 28)}…` : p.title}
                  </Link>
                ),
              },
              { key: 'price', header: 'Price', render: (p) => formatPrice(p.price, p.status) },
              { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} className="px-2 py-0.5 text-[10px]" /> },
              { key: 'createdAt', header: 'Listed', render: (p) => timeAgo(p.createdAt) },
            ]}
            rows={data.recentListings}
          />
        </div>
      </div>
    </>
  );
}
