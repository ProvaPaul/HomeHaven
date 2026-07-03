import { STATUS_LABELS } from '../../lib/format';
import { cn } from '../../lib/utils';

const styles = {
  'for-sale': 'bg-emerald-600 text-white',
  'for-rent': 'bg-primary-600 text-white',
  sold: 'bg-gray-700 text-white',
  rented: 'bg-amber-600 text-white',
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm',
        styles[status] || 'bg-gray-600 text-white',
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
