import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';
import AdminRoute from '../components/common/AdminRoute';
import PageLoader from '../components/common/PageLoader';
import RouteError from '../components/common/RouteError';

// Route-level code splitting: each page loads on demand, so the initial
// bundle stays small and the charts library only ships to dashboard visitors.
const DashboardLayout = lazy(() => import('../components/dashboard/DashboardLayout'));
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Properties = lazy(() => import('../pages/Properties'));
const PropertyDetails = lazy(() => import('../pages/PropertyDetails'));
const AddProperty = lazy(() => import('../pages/AddProperty'));
const EditProperty = lazy(() => import('../pages/EditProperty'));
const MyProperties = lazy(() => import('../pages/MyProperties'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Compare = lazy(() => import('../pages/Compare'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Overview = lazy(() => import('../pages/dashboard/Overview'));
const Insights = lazy(() => import('../pages/dashboard/Insights'));
const SavedSearches = lazy(() => import('../pages/dashboard/SavedSearches'));
const RecentlyViewedPage = lazy(() => import('../pages/dashboard/RecentlyViewedPage'));
const Notifications = lazy(() => import('../pages/dashboard/Notifications'));
const Documents = lazy(() => import('../pages/dashboard/Documents'));
const DocumentDetails = lazy(() => import('../pages/dashboard/DocumentDetails'));
const Settings = lazy(() => import('../pages/dashboard/Settings'));
const AdminOverview = lazy(() => import('../pages/dashboard/admin/AdminOverview'));
const ManageUsers = lazy(() => import('../pages/dashboard/admin/ManageUsers'));
const ManageListings = lazy(() => import('../pages/dashboard/admin/ManageListings'));
const Reports = lazy(() => import('../pages/dashboard/admin/Reports'));

const page = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(Home) },
      { path: '/about', element: page(About) },
      { path: '/contact', element: page(Contact) },
      { path: '/properties', element: page(Properties) },
      { path: '/compare', element: page(Compare) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/properties/new', element: page(AddProperty) },
          { path: '/properties/:id/edit', element: page(EditProperty) },
        ],
      },
      { path: '/properties/:id', element: page(PropertyDetails) },
      // Legacy paths → dashboard equivalents
      { path: '/profile', element: <Navigate to="/dashboard/settings" replace /> },
      { path: '/my-properties', element: <Navigate to="/dashboard/listings" replace /> },
      { path: '/favorites', element: <Navigate to="/dashboard/favorites" replace /> },
      { path: '*', element: page(NotFound) },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/dashboard',
        element: page(DashboardLayout),
        children: [
          { index: true, element: page(Overview) },
          { path: 'insights', element: page(Insights) },
          { path: 'listings', element: page(MyProperties) },
          { path: 'favorites', element: page(Favorites) },
          { path: 'saved-searches', element: page(SavedSearches) },
          { path: 'recently-viewed', element: page(RecentlyViewedPage) },
          { path: 'notifications', element: page(Notifications) },
          { path: 'documents', element: page(Documents) },
          { path: 'documents/:id', element: page(DocumentDetails) },
          { path: 'settings', element: page(Settings) },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin', element: page(AdminOverview) },
              { path: 'admin/users', element: page(ManageUsers) },
              { path: 'admin/listings', element: page(ManageListings) },
              { path: 'admin/reports', element: page(Reports) },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: page(Login) },
          { path: '/register', element: page(Register) },
        ],
      },
    ],
  },
]);
