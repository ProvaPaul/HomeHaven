import { useTheme } from '../providers/ThemeProvider';

/**
 * Chart color tokens following the data-viz method:
 * - categorical hues in FIXED order per entity (never cycled or repainted)
 * - one hue (blue) for single-series magnitude over time
 * - both palettes validated for CVD separation and surface contrast
 *   (light on #ffffff, dark on #111827)
 */
const CATEGORICAL = {
  light: ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#199e70', '#c98500', '#008300', '#9085e9', '#e66767'],
};

// Fixed entity → slot assignments (color follows the entity, never its rank)
const TYPE_SLOTS = { house: 0, apartment: 1, villa: 2, condo: 3, land: 4, commercial: 5 };
const STATUS_SLOTS = { 'for-sale': 0, 'for-rent': 1, sold: 4, rented: 2 };

export function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const series = CATEGORICAL[dark ? 'dark' : 'light'];

  return {
    dark,
    // single-series magnitude (time series)
    primary: series[0],
    primaryFill: dark ? 'rgba(57,135,229,0.22)' : 'rgba(42,120,214,0.14)',
    series,
    colorForType: (type) => series[TYPE_SLOTS[type] ?? 5],
    colorForStatus: (status) => series[STATUS_SLOTS[status] ?? 5],
    // recessive chrome
    grid: dark ? '#2b3444' : '#e5e7eb',
    axis: dark ? '#4b5563' : '#d1d5db',
    tick: dark ? '#9ca3af' : '#6b7280',
    tooltip: {
      backgroundColor: dark ? '#1f2937' : '#ffffff',
      border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      color: dark ? '#f9fafb' : '#111827',
      fontSize: '12px',
    },
  };
}
