import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

const LEVELS = {
  safe: {
    label: 'Safe',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  attention: {
    label: 'Needs Attention',
    icon: AlertTriangle,
    classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  risky: {
    label: 'Potentially Risky',
    icon: AlertOctagon,
    classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
};

/**
 * Risk-level badge for a lease clause — always icon + text label, never
 * color alone, per the app's accessibility conventions.
 * @param {{ level: 'safe'|'attention'|'risky' }} props
 */
export default function RiskBadge({ level }) {
  const config = LEVELS[level] || LEVELS.attention;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
