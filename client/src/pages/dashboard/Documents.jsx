import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight, FileText, Trash2 } from 'lucide-react';

import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/dashboard/EmptyState';
import DocumentUploadCard from '../../components/documents/DocumentUploadCard';
import AnalysisReport from '../../components/documents/AnalysisReport';
import { useDocumentHistory } from '../../hooks/useDocumentHistory';
import { DOCUMENT_TYPE_LABELS, timeAgo } from '../../lib/format';
import { usePageTitle } from '../../hooks/usePageTitle';

const scoreColor = (score) => {
  if (score >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

export default function Documents() {
  usePageTitle('Document Analyzer', 'Upload a lease or sale agreement for an instant AI risk analysis.');
  const navigate = useNavigate();
  const { documents, isLoading, remove, refresh } = useDocumentHistory();
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const handleAnalyzed = (analysis) => {
    setActiveAnalysis(analysis);
    refresh();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    try {
      await remove(id);
      toast.success('Analysis deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Document Analyzer"
        subtitle="Upload a rental agreement, lease contract, or sale agreement for an instant AI risk analysis."
      />

      {activeAnalysis ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveAnalysis(null)}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Analyze another document
          </button>
          <AnalysisReport analysis={activeAnalysis} />
        </div>
      ) : (
        <DocumentUploadCard onAnalyzed={handleAnalyzed} />
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Previous Analyses</h2>

        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No analyses yet"
            message="Upload your first document above to get an instant AI risk report."
          />
        )}

        {!isLoading && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => (
              <button
                key={doc._id}
                type="button"
                onClick={() => navigate(`/dashboard/documents/${doc._id}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {DOCUMENT_TYPE_LABELS[doc.documentType] || 'Document'} · {timeAgo(doc.createdAt)}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-bold tabular-nums ${scoreColor(doc.safetyScore)}`}>
                  {doc.safetyScore}/100
                </p>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, doc._id)}
                  aria-label={`Delete analysis of ${doc.fileName}`}
                  className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-700" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
