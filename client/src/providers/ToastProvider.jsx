import { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeProvider';

export default function ToastProvider() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: dark ? '#111827' : '#ffffff',
          color: dark ? '#f9fafb' : '#111827',
          border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
          fontSize: '14px',
          borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
        error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
      }}
    />
  );
}
