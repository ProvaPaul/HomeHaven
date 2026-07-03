import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/dashboard/EmptyState';
import Button from '../../components/ui/Button';
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  selectNotifications,
} from '../../features/notifications/notificationsSlice';
import { timeAgo } from '../../lib/format';
import { cn } from '../../lib/utils';

const TYPE_ICONS = { inquiry: '📩', verification: '✅', welcome: '👋', system: '🔔' };

export default function Notifications() {
  const dispatch = useDispatch();
  const { items, unread, status } = useSelector(selectNotifications);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You’re all caught up'}
        action={
          unread > 0 && (
            <Button variant="outline" size="sm" onClick={() => dispatch(markAllNotificationsRead())}>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )
        }
      />

      {status === 'loading' && items.length === 0 ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="Inquiries, verification updates, and announcements will appear here."
          actionTo="/properties"
          actionLabel="Browse Properties"
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <div
              key={n._id}
              className={cn(
                'flex gap-4 rounded-2xl border bg-white p-4 transition dark:bg-gray-900',
                n.read
                  ? 'border-gray-200 dark:border-gray-800'
                  : 'border-primary-200 bg-primary-50/40 dark:border-primary-500/30 dark:bg-primary-500/5'
              )}
            >
              <span className="mt-0.5 text-xl leading-none">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                  <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => !n.read && dispatch(markNotificationRead(n._id))}
                    className="mt-1.5 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    View details →
                  </Link>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => dispatch(markNotificationRead(n._id))}
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(deleteNotification(n._id))}
                  aria-label="Delete notification"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
