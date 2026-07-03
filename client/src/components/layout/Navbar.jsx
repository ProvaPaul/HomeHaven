import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Home,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Menu,
  Scale,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import ThemeToggle from '../common/ThemeToggle';
import NotificationsBell from '../dashboard/NotificationsBell';
import { selectUser } from '../../features/auth/authSlice';
import { logoutUser } from '../../features/auth/authThunks';
import { selectFavoriteIds } from '../../features/favorites/favoritesSlice';
import { selectCompareIds } from '../../features/compare/compareSlice';
import { fetchNotifications } from '../../features/notifications/notificationsSlice';
import { cn } from '../../lib/utils';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function IconLink({ to, icon: Icon, label, count }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <Icon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-semibold text-white">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:block">{user.name}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/listings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LayoutList className="h-4 w-4" />
              My Listings
            </Link>
            <Link
              to="/dashboard/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Heart className="h-4 w-4" />
              My Wishlist
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <User className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useSelector(selectUser);
  const favoriteCount = useSelector(selectFavoriteIds).length;
  const compareCount = useSelector(selectCompareIds).length;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMobileLogout = async () => {
    setMobileOpen(false);
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all',
        scrolled
          ? 'border-gray-200 bg-white/90 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/90'
          : 'border-transparent bg-white dark:bg-gray-950'
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Home className="h-[18px] w-[18px]" />
          </span>
          HomeHaven
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1 sm:flex">
            <IconLink to="/compare" icon={Scale} label="Compare properties" count={compareCount} />
            {user && <IconLink to="/dashboard/favorites" icon={Heart} label="My wishlist" count={favoriteCount} />}
          </div>
          {user && <NotificationsBell />}
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden"
          >
            <div className="container-page space-y-1 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-4 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="!mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <NavLink
                  to="/compare"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Scale className="h-4 w-4" />
                  Compare {compareCount > 0 && `(${compareCount})`}
                </NavLink>
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/dashboard/favorites"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Heart className="h-4 w-4" />
                      My Wishlist {favoriteCount > 0 && `(${favoriteCount})`}
                    </NavLink>
                    <NavLink
                      to="/dashboard/listings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <LayoutList className="h-4 w-4" />
                      My Listings
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleMobileLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
