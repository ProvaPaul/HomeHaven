import { useRef, useState } from 'react';
import { AlertCircle, FileText, Loader2, UploadCloud } from 'lucide-react';

import Select from '../ui/Select';
import Button from '../ui/Button';
import { useDocumentAnalysis } from '../../hooks/useDocumentAnalysis';
import { DOCUMENT_TYPE_LABELS } from '../../lib/format';

const MAX_SIZE_MB = 8;
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

const documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

/**
 * Upload UI for the AI Lease & Property Document Analyzer — file picker,
 * document type selector, upload progress, and AI-analyzing loading state.
 *
 * @param {{ onAnalyzed: (analysis: object) => void }} props
 */
export default function DocumentUploadCard({ onAnalyzed }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('rental-agreement');
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState('');
  const { analyze, progress, isAnalyzing, error } = useDocumentAnalysis();

  const validateAndSetFile = (candidate) => {
    setClientError('');
    if (!candidate) return;
    const ext = candidate.name.slice(candidate.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setClientError('Only PDF and DOCX files are supported');
      return;
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setClientError(`File exceeds the ${MAX_SIZE_MB}MB limit`);
      return;
    }
    setFile(candidate);
  };

  const handleFileInput = (e) => validateAndSetFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const analysis = await analyze(file, documentType);
    if (analysis) onAnalyzed(analysis);
  };

  const busy = isAnalyzing;
  const uploading = busy && progress < 100;
  const analyzingWithAi = busy && progress >= 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload a Document</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Rental agreement, lease contract, or property sale agreement — PDF or DOCX, up to {MAX_SIZE_MB}MB.
      </p>

      <div className="mt-4">
        <Select
          label="Document type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          options={documentTypeOptions}
          disabled={busy}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileInput}
        className="hidden"
        id="document-upload"
        disabled={busy}
      />
      <label
        htmlFor="document-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
          dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-300 hover:border-primary-400 dark:border-gray-700'
        } ${busy ? 'pointer-events-none opacity-60' : ''}`}
      >
        {file ? (
          <FileText className="h-7 w-7 text-primary-600 dark:text-primary-400" />
        ) : (
          <UploadCloud className="h-7 w-7 text-gray-400" />
        )}
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {file ? file.name : 'Click to upload or drag and drop'}
        </p>
        {!file && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">PDF or DOCX only</p>}
      </label>

      {clientError && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {clientError}
        </p>
      )}
      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-primary-600 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Uploading… {progress}%</p>
        </div>
      )}
      {analyzingWithAi && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing document with AI — this can take up to 30 seconds…
        </div>
      )}

      <Button onClick={handleSubmit} isLoading={busy} disabled={!file || busy} className="mt-5 w-full">
        Analyze Document
      </Button>
    </div>
  );
}
