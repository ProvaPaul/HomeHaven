import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Bookmark,
  Heart,
  History,
  Home,
  LayoutDashboard,
  LayoutList,
  LineChart,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  Bell,
  BadgeCheck,
  X,
} from 'lucide-react';

import ThemeToggle from '../common/ThemeToggle';
import NotificationsBell from './NotificationsBell';
import { selectUser } from '../../features/auth/authSlice';
import { logoutUser } from '../../features/auth/authThunks';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { cn } from '../../lib/utils';

const userLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/dashboard/listings', label: 'My Listings', icon: LayoutList },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { to: '/dashboard/saved-searches', label: 'Saved Searches', icon: Bookmark },
  { to: '/dashboard/recently-viewed', label: 'Recently Viewed', icon: History },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/dashboard/admin', label: 'Analytics', icon: LineChart, end: true },
  { to: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
  { to: '/dashboard/admin/listings', label: 'Manage Listings', icon: BadgeCheck },
  { to: '/dashboard/admin/reports', label: 'Reports', icon: Shield },
];

function SidebarContent({ onNavigate }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onNavigate?.();
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
      isActive
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    );

  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Home className="h-[18px] w-[18px]" />
        </span>
        HomeHaven
      </Link>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">My Dashboard</p>
        {userLinks.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={linkClass}>
            <link.icon className="h-[18px] w-[18px]" />
            {link.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Admin</p>
            {adminLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={linkClass}>
                <link.icon className="h-[18px] w-[18px]" />
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-semibold text-white">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="truncate text-xs capitalize text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/insights': 'AI Insights',
  '/dashboard/listings': 'My Listings',
  '/dashboard/favorites': 'My Wishlist',
  '/dashboard/saved-searches': 'Saved Searches',
  '/dashboard/recently-viewed': 'Recently Viewed',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
  '/dashboard/admin': 'Admin Analytics',
  '/dashboard/admin/users': 'Manage Users',
  '/dashboard/admin/listings': 'Manage Listings',
  '/dashboard/admin/reports': 'Reports',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = `${PAGE_TITLES[pathname] || 'Dashboard'} | HomeHaven`;
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-xl dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to="/properties"
              className="hidden text-sm font-medium text-gray-500 transition hover:text-primary-600 dark:text-gray-400 sm:block"
            >
              ← Back to site
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationsBell />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
