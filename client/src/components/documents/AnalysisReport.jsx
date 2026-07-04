import { AlertTriangle, Download, FileText, HelpCircle, ListChecks, MessageSquareWarning, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../ui/Button';
import RiskBadge from './RiskBadge';
import SafetyScoreMeter from './SafetyScoreMeter';
import { downloadAnalysisReportPdf } from '../../lib/documentReportPdf';
import { DOCUMENT_TYPE_LABELS } from '../../lib/format';

const FIELD_LABELS = {
  rentAmount: 'Rent Amount',
  securityDeposit: 'Security Deposit',
  leaseDuration: 'Lease Duration',
  noticePeriod: 'Notice Period',
  renewalTerms: 'Renewal Terms',
  maintenanceResponsibility: 'Maintenance Responsibility',
  utilityResponsibility: 'Utility Responsibility',
  hiddenCharges: 'Hidden Charges',
  latePaymentPenalty: 'Late Payment Penalty',
  terminationConditions: 'Termination Conditions',
};

function BulletSection({ icon: Icon, title, items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Full structured AI analysis report — key terms, risk analysis, safety
 * score, summary, and actionable follow-ups. Used both right after upload
 * and when viewing a saved analysis from history.
 *
 * @param {{ analysis: object, onDelete?: () => void }} props
 */
export default function AnalysisReport({ analysis, onDelete }) {
  const handleDownload = () => {
    downloadAnalysisReportPdf(analysis);
    toast.success('Report downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{analysis.fileName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {DOCUMENT_TYPE_LABELS[analysis.documentType] || 'Document'}
              {analysis.createdAt && ` · ${new Date(analysis.createdAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {onDelete && (
            <Button variant="danger" onClick={onDelete} aria-label="Delete analysis">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!analysis.aiGenerated && (
        <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          This is a keyword-based scan (no AI key configured) — treat it as a starting point, not a full legal review.
        </p>
      )}

      <SafetyScoreMeter score={analysis.safetyScore} />

      {/* Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white">Summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{analysis.summary}</p>
      </div>

      {/* Key terms */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white">Key Terms</h3>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
              <dd className="mt-0.5 text-sm text-gray-800 dark:text-gray-200">{analysis.extraction?.[key] || 'Not specified'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Risk analysis */}
      {analysis.riskAnalysis?.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Risk Analysis</h3>
          <div className="mt-3 space-y-3">
            {analysis.riskAnalysis.map((risk, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3.5 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{risk.clause}</p>
                  <RiskBadge level={risk.level} />
                </div>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{risk.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <BulletSection icon={ListChecks} title="Important Clauses" items={analysis.importantClauses} />
        <BulletSection icon={MessageSquareWarning} title="Negotiation Points" items={analysis.negotiationPoints} />
        <BulletSection icon={HelpCircle} title="Questions to Ask" items={analysis.questionsForLandlord} />
      </div>
    </div>
  );
}
