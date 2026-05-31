import { useCallback, useEffect, useState } from 'react';

interface UseApiQueryOptions<T> {
  fetchFn: () => Promise<T>;
  enabled?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function useApiQuery<T>({ fetchFn, enabled = true }: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      setData(await fetchFn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
