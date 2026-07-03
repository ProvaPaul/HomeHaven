import { createBrowserRouter } from 'react-router-dom';

import RootLayout from '../components/layout/RootLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import GuestRoute from '../components/common/GuestRoute';

import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Properties from '../pages/Properties';
import PropertyDetails from '../pages/PropertyDetails';
import AddProperty from '../pages/AddProperty';
import EditProperty from '../pages/EditProperty';
import MyProperties from '../pages/MyProperties';
import Favorites from '../pages/Favorites';
import Compare from '../pages/Compare';
import NotFound from '../pages/NotFound';

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
          { path: '/profile', element: <Profile /> },
          { path: '/properties/new', element: <AddProperty /> },
          { path: '/properties/:id/edit', element: <EditProperty /> },
          { path: '/my-properties', element: <MyProperties /> },
          { path: '/favorites', element: <Favorites /> },
        ],
      },
      { path: '/properties/:id', element: <PropertyDetails /> },
      { path: '*', element: <NotFound /> },
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
