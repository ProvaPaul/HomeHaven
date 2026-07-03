import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectUser, selectIsCheckingAuth } from '../../features/auth/authSlice';
import PageLoader from './PageLoader';

export default function AdminRoute() {
  const user = useSelector(selectUser);
  const isCheckingAuth = useSelector(selectIsCheckingAuth);

  if (isCheckingAuth) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
