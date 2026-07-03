import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectIsAuthenticated, selectIsCheckingAuth } from '../../features/auth/authSlice';
import PageLoader from './PageLoader';

// Keeps logged-in users out of login/register pages
export default function GuestRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isCheckingAuth = useSelector(selectIsCheckingAuth);
  const location = useLocation();

  if (isCheckingAuth) return <PageLoader />;

  if (isAuthenticated) {
    const to = location.state?.from || '/';
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}
