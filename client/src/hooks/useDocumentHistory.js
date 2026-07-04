import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';

/**
 * Fetches and manages the current user's past document analyses.
 *
 * @returns {{
 *   documents: Array<object>,
 *   isLoading: boolean,
 *   error: string,
 *   remove: (id: string) => Promise<void>,
 *   refresh: () => void,
 * }}
 */
export function useDocumentHistory() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    api
      .get('/documents')
      .then(({ data }) => alive && setDocuments(data.documents))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const remove = useCallback(async (id) => {
    await api.delete(`/documents/${id}`);
    setDocuments((docs) => docs.filter((d) => d._id !== id));
  }, []);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { documents, isLoading, error, remove, refresh };
}
