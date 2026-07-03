import { useDispatch, useSelector } from 'react-redux';
import { Scale } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  toggleCompare,
  selectIsCompared,
  selectCompareIds,
  COMPARE_LIMIT,
} from '../../features/compare/compareSlice';
import { cn } from '../../lib/utils';

export default function CompareButton({ propertyId, className }) {
  const dispatch = useDispatch();
  const isCompared = useSelector(selectIsCompared(propertyId));
  const ids = useSelector(selectCompareIds);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isCompared && ids.length >= COMPARE_LIMIT) {
      toast.error(`You can compare up to ${COMPARE_LIMIT} properties`);
      return;
    }
    dispatch(toggleCompare(propertyId));
    toast.success(isCompared ? 'Removed from comparison' : 'Added to comparison');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 dark:bg-gray-900/90',
        className
      )}
    >
      <Scale
        className={cn(
          'h-[18px] w-[18px] transition',
          isCompared ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
        )}
      />
    </button>
  );
}
