import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';

export default function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
