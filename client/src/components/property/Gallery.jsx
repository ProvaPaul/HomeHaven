import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e5e7eb"/><path d="M200 100l-60 48h18v52h30v-32h24v32h30v-52h18l-60-48z" fill="%239ca3af"/></svg>';

export default function Gallery({ images = [], title = 'Property' }) {
  const pics = images.length ? images : [FALLBACK_IMAGE];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setActive((i) => (i - 1 + pics.length) % pics.length), [pics.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % pics.length), [pics.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, prev, next]);

  const NavButton = ({ dir, onClick, className }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous image' : 'Next image'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:scale-105 dark:bg-gray-900/90 dark:text-gray-100',
        className
      )}
    >
      {dir === 'prev' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
        <img
          src={pics[active]}
          alt={`${title} — photo ${active + 1}`}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover"
        />
        {pics.length > 1 && (
          <>
            <NavButton dir="prev" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <NavButton dir="next" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2" />
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1} / {pics.length}
            </span>
          </>
        )}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="View fullscreen"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails */}
      {pics.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={cn(
                'relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === active
                  ? 'border-primary-600'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              aria-label="Close fullscreen"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={pics[active]}
              alt={`${title} — fullscreen`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            {pics.length > 1 && (
              <>
                <NavButton
                  dir="prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                />
                <NavButton
                  dir="next"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-white/10 px-3 py-1 text-sm text-white">
                  {active + 1} / {pics.length}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
