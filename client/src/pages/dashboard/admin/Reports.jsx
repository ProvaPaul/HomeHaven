import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileBarChart } from 'lucide-react';

import PageHeader from '../../../components/dashboard/PageHeader';
import ChartCard from '../../../components/dashboard/ChartCard';
import DataTable from '../../../components/dashboard/DataTable';
import Button from '../../../components/ui/Button';
import api from '../../../lib/axios';
import { useChartTheme } from '../../../lib/chartTheme';
import { STATUS_LABELS, TYPE_LABELS, formatPrice } from '../../../lib/format';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const toCsv = (rows, headers) => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
};

const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }
  if (!data) return null;

  const citySeries = data.topCities.map((c) => ({ name: c.city, count: c.count }));

  const exportMarketReport = () => {
    const rows = [
      ['— Totals —', ''],
      ['Users', data.totals.users],
      ['Listings', data.totals.properties],
      ['Inquiries', data.totals.inquiries],
      ['Total views', data.totals.views],
      ['Pending verification', data.totals.pendingVerification],
      ['', ''],
      ['— Listings by type —', ''],
      ...data.listingsByType.map((t) => [TYPE_LABELS[t.type] || t.type, t.count]),
      ['', ''],
      ['— Listings by status —', ''],
      ...data.listingsByStatus.map((s) => [STATUS_LABELS[s.status] || s.status, s.count]),
      ['', ''],
      ['— Top cities —', ''],
      ...data.topCities.map((c) => [c.city, `${c.count} listings, avg ${formatPrice(c.avgPrice)}`]),
      ['', ''],
      ['— New users by month —', ''],
      ...data.usersByMonth.map((m) => [m.month, m.count]),
    ];
    downloadCsv(`homehaven-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, ['Metric', 'Value']));
    toast.success('Report downloaded');
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Marketplace performance summaries, exportable as CSV."
        action={
          <Button onClick={exportMarketReport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <ChartCard title="Listings by City" subtitle="Top locations by inventory">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={citySeries} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={chart.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={{ stroke: chart.axis }} tickLine={false} />
            <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={chart.tooltip} cursor={{ fill: chart.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="count" name="Listings" fill={chart.primary} radius={[6, 6, 0, 0]} barSize={36} label={{ position: 'top', fill: chart.tick, fontSize: 12 }}>
              {citySeries.map((entry) => (
                <Cell key={entry.name} fill={chart.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <FileBarChart className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            Inventory by Type
          </h3>
          <DataTable
            rowKey="type"
            columns={[
              { key: 'type', header: 'Type', render: (r) => TYPE_LABELS[r.type] || r.type },
              { key: 'count', header: 'Listings' },
              {
                key: 'share',
                header: 'Share',
                render: (r) => `${((r.count / Math.max(1, data.totals.properties)) * 100).toFixed(1)}%`,
              },
            ]}
            rows={data.listingsByType}
          />
        </div>
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <FileBarChart className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            Market Value by City
          </h3>
          <DataTable
            rowKey="city"
            columns={[
              { key: 'city', header: 'City' },
              { key: 'count', header: 'Listings' },
              { key: 'avgPrice', header: 'Avg. Price', render: (r) => formatPrice(r.avgPrice) },
            ]}
            rows={data.topCities}
          />
        </div>
      </div>
    </>
  );
}
