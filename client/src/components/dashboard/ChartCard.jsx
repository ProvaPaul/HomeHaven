import { cn } from '../../lib/utils';

// Wrapper that gives every chart the same chrome: title, optional subtitle,
// fixed height body so Recharts' ResponsiveContainer has room to render.
export default function ChartCard({ title, subtitle, action, height = 280, className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </div>
  );
}
