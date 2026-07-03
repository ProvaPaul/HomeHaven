import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
} from '../../features/notifications/notificationsSlice';
import { timeAgo } from '../../lib/format';
import { cn } from '../../lib/utils';

const TYPE_ICONS = { inquiry: '📩', verification: '✅', welcome: '👋', system: '🔔' };

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unread } = useSelector(selectNotifications);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleItemClick = (n) => {
    setOpen(false);
    if (!n.read) dispatch(markNotificationRead(n._id));
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              ) : (
                items.slice(0, 8).map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-gray-800/50',
                      !n.read && 'bg-primary-50/50 dark:bg-primary-500/5'
                    )}
                  >
                    <span className="mt-0.5 text-lg leading-none">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-gray-600 dark:text-gray-400">
                        {n.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                  </button>
                ))
              )}
            </div>

            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-gray-100 px-4 py-2.5 text-center text-sm font-medium text-primary-600 transition hover:bg-gray-50 dark:border-gray-800 dark:text-primary-400 dark:hover:bg-gray-800/50"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
