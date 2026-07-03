import { createBrowserRouter, Navigate } from 'react-router-dom';

import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';
import AdminRoute from '../components/common/AdminRoute';

import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Properties from '../pages/Properties';
import PropertyDetails from '../pages/PropertyDetails';
import AddProperty from '../pages/AddProperty';
import EditProperty from '../pages/EditProperty';
import MyProperties from '../pages/MyProperties';
import Favorites from '../pages/Favorites';
import Compare from '../pages/Compare';
import NotFound from '../pages/NotFound';

import Overview from '../pages/dashboard/Overview';
import SavedSearches from '../pages/dashboard/SavedSearches';
import RecentlyViewedPage from '../pages/dashboard/RecentlyViewedPage';
import Notifications from '../pages/dashboard/Notifications';
import Settings from '../pages/dashboard/Settings';
import AdminOverview from '../pages/dashboard/admin/AdminOverview';
import ManageUsers from '../pages/dashboard/admin/ManageUsers';
import ManageListings from '../pages/dashboard/admin/ManageListings';
import Reports from '../pages/dashboard/admin/Reports';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/properties', element: <Properties /> },
      { path: '/compare', element: <Compare /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/properties/new', element: <AddProperty /> },
          { path: '/properties/:id/edit', element: <EditProperty /> },
        ],
      },
      { path: '/properties/:id', element: <PropertyDetails /> },
      // Legacy paths → dashboard equivalents
      { path: '/profile', element: <Navigate to="/dashboard/settings" replace /> },
      { path: '/my-properties', element: <Navigate to="/dashboard/listings" replace /> },
      { path: '/favorites', element: <Navigate to="/dashboard/favorites" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Overview /> },
          { path: 'listings', element: <MyProperties /> },
          { path: 'favorites', element: <Favorites /> },
          { path: 'saved-searches', element: <SavedSearches /> },
          { path: 'recently-viewed', element: <RecentlyViewedPage /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'settings', element: <Settings /> },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin', element: <AdminOverview /> },
              { path: 'admin/users', element: <ManageUsers /> },
              { path: 'admin/listings', element: <ManageListings /> },
              { path: 'admin/reports', element: <Reports /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
    ],
  },
]);
