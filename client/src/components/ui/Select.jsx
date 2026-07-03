import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, id, ...props },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn('input-field appearance-none pr-9', error && 'input-error')}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

export default Select;
