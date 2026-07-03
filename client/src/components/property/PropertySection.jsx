import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PropertyGrid from './PropertyGrid';

// Reusable "titled row of property cards" used on Home (Featured, Latest, …)
export default function PropertySection({
  title,
  subtitle,
  properties,
  isLoading,
  linkTo,
  linkLabel = 'View all',
  className = '',
}) {
  if (!isLoading && !properties?.length) return null;

  return (
    <section className={className}>
      <div className="container-page py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
          {linkTo && (
            <Link
              to={linkTo}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition hover:gap-2.5 dark:text-primary-400"
            >
              {linkLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="mt-8">
          <PropertyGrid properties={properties} isLoading={isLoading} skeletonCount={3} />
        </div>
      </div>
    </section>
  );
}
