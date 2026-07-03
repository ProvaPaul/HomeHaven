import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, actionTo, actionLabel }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-14 text-center dark:border-gray-700">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-7 w-7 text-gray-400" />
      </span>
      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{message}</p>}
      {actionTo && (
        <Link
          to={actionTo}
          className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
