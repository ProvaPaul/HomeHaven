import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function ShareButton({ title, className, children }) {
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'HomeHaven Property', url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share property"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
        className
      )}
    >
      <Share2 className="h-4 w-4" />
      {children ?? 'Share'}
    </button>
  );
}
