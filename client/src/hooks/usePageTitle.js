import { useEffect } from 'react';

const BASE = 'HomeHaven';

// Sets document.title (and optionally the meta description) for SEO.
export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} | Find Your Perfect Home`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
