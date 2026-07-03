import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const getPageNumbers = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', pages];
  if (page >= pages - 3) return [1, '…', pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, '…', page - 1, page, page + 1, '…', pages];
};

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers(page, pages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition',
              p === page
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
