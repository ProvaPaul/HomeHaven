import { cn } from '../../lib/utils';

/**
 * Minimal table for dashboard lists.
 * columns: [{ key, header, render?, className? }]
 */
export default function DataTable({ columns, rows, rowKey = '_id', isLoading, emptyMessage = 'No data' }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-[560px] bg-white text-sm dark:bg-gray-900">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row[rowKey]}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/40"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-gray-800 dark:text-gray-200', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
