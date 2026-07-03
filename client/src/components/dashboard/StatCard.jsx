import { cn } from '../../lib/utils';

const number = new Intl.NumberFormat('en-US');

export default function StatCard({ icon: Icon, label, value, hint, className }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        {typeof value === 'number' ? number.format(value) : value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
