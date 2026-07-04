import { useCallback, useState } from 'react';
import api from '../lib/axios';

/**
 * Uploads a PDF/DOCX lease document for AI analysis, tracking upload
 * progress and the resulting structured report.
 *
 * @returns {{
 *   analyze: (file: File, documentType: string) => Promise<object|null>,
 *   progress: number,
 *   isAnalyzing: boolean,
 *   error: string,
 *   result: object|null,
 *   reset: () => void,
 * }}
 */
export function useDocumentAnalysis() {
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const analyze = useCallback(async (file, documentType) => {
    setIsAnalyzing(true);
    setError('');
    setProgress(0);
    setResult(null);

    const form = new FormData();
    form.append('file', file);
    form.append('documentType', documentType);

    try {
      const { data } = await api.post('/documents/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setResult(data.analysis);
      return data.analysis;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setError('');
    setResult(null);
  }, []);

  return { analyze, progress, isAnalyzing, error, result, reset };
}
