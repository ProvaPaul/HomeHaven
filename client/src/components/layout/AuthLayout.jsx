import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

import ThemeToggle from '../common/ThemeToggle';
import { fetchCurrentUser } from '../../features/auth/authThunks';

export default function AuthLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary-700 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, white 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Home className="h-5 w-5" />
            </span>
            HomeHaven
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="max-w-md text-4xl font-bold leading-tight">
              Find a place you'll love to live.
            </h2>
            <p className="mt-4 max-w-md text-lg text-primary-100">
              Join thousands of happy homeowners who found their perfect home with HomeHaven.
            </p>
          </motion.div>
          <p className="text-sm text-primary-200">
            © {new Date().getFullYear()} HomeHaven. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <Link
          to="/"
          className="mb-8 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Home className="h-4 w-4" />
          </span>
          HomeHaven
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
