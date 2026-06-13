import { useCallback } from 'react';
import { fetchPerfilOperativo, PerfilOperativo } from '../api';
import { useApiQuery } from './useApiQuery';
import { useAuth } from './useAuth';

export function usePerfilOperativo() {
  const { isAuthenticated, isBrigadistaOnly } = useAuth();

  const fetchFn = useCallback(() => fetchPerfilOperativo(), []);

  const query = useApiQuery<PerfilOperativo>({
    fetchFn,
    enabled: isAuthenticated && isBrigadistaOnly,
  });

  return {
    perfil: query.data,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}
