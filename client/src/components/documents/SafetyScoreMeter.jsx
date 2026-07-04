import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

function getBand(score) {
  if (score >= 75) return { label: 'Safe', icon: CheckCircle2, fill: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-400' };
  if (score >= 50) return { label: 'Needs Attention', icon: AlertTriangle, fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' };
  return { label: 'Risky', icon: AlertOctagon, fill: 'bg-red-600', text: 'text-red-700 dark:text-red-400' };
}

/**
 * Overall Safety Score meter — a single-value progress track, colored by
 * risk band, always paired with an icon + text label (never color alone).
 * @param {{ score: number }} props
 */
export default function SafetyScoreMeter({ score }) {
  const band = getBand(score);
  const Icon = band.icon;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Safety Score</p>
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${band.text}`}>
          <Icon className="h-4 w-4" />
          {band.label}
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white">
        {score}
        <span className="text-lg font-medium text-gray-400 dark:text-gray-500">/100</span>
      </p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${band.fill}`}
          style={{ width: `${Math.max(2, score)}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall safety score"
        />
      </div>
    </div>
  );
}
