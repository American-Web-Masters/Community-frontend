import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchBiblePassage } from '../api/bible';

/**
 * Debounced Bible passage lookup with abort-on-change.
 *
 * @param {string} query
 * @param {{ enabled?: boolean, debounceMs?: number }} options
 */
const useBiblePassageLookup = (query, options = {}) => {
  const enabled = options.enabled ?? true;
  const debounceMs = options.debounceMs ?? 450;

  const normalizedQuery = useMemo(() => String(query || '').trim().replace(/\s+/g, ' '), [query]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const lastQueryRef = useRef('');

  useEffect(() => {
    if (!enabled || !normalizedQuery) {
      setLoading(false);
      setError('');
      setData(null);
      lastQueryRef.current = '';
      return;
    }

    setError('');
    setLoading(true);
    lastQueryRef.current = normalizedQuery;

    const abortController = new AbortController();
    const handle = setTimeout(async () => {
      try {
        const result = await fetchBiblePassage(normalizedQuery, { signal: abortController.signal });
        if (abortController.signal.aborted) return;

        // Ignore stale results.
        if (lastQueryRef.current !== normalizedQuery) return;

        setData(result);
        setError('');
      } catch (e) {
        if (abortController.signal.aborted) return;
        if (lastQueryRef.current !== normalizedQuery) return;

        setData(null);
        setError(e?.message || 'Failed to fetch verse.');
      } finally {
        if (abortController.signal.aborted) return;
        if (lastQueryRef.current !== normalizedQuery) return;
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handle);
      abortController.abort();
    };
  }, [debounceMs, enabled, normalizedQuery]);

  return {
    query: normalizedQuery,
    loading,
    error,
    data,
  };
};

export default useBiblePassageLookup;
