export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-3 p-4">
        <div className="flex justify-between">
          <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3.5 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
