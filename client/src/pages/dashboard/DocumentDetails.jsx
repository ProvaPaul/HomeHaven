import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';

import AnalysisReport from '../../components/documents/AnalysisReport';
import api from '../../lib/axios';
import { usePageTitle } from '../../hooks/usePageTitle';

function DetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  usePageTitle(analysis?.fileName || 'Document Analysis');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/documents/${id}`)
      .then(({ data }) => alive && setAnalysis(data.analysis))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Analysis deleted');
      navigate('/dashboard/documents');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/dashboard/documents" className="transition hover:text-primary-600">Document Analyzer</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-gray-900 dark:text-white">{analysis?.fileName || 'Analysis'}</span>
      </nav>

      {loading && <DetailsSkeleton />}
      {!loading && error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</p>
      )}
      {!loading && analysis && <AnalysisReport analysis={analysis} onDelete={handleDelete} />}
    </>
  );
}
