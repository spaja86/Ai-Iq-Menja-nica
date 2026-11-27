import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  fetchOnMount?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  refetch: () => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    initialData = null,
    onSuccess,
    onError,
    fetchOnMount = false,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastArgs, setLastArgs] = useState<any[]>([]);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        setLastArgs(args);

        const result = await apiFunction(...args);
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const refetch = useCallback((): Promise<T | null> => {
    return execute(...lastArgs);
  }, [execute, lastArgs]);

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
    setLastArgs([]);
  }, [initialData]);

  useEffect(() => {
    if (fetchOnMount) {
      execute();
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch,
    reset,
  };
}

// Specialized hooks for common API calls
export function useTradingPairs() {
  return useApi(api.getTradingPairs.bind(api), { fetchOnMount: true });
}

export function useOrderBook(symbol: string) {
  return useApi(
    (sym: string) => api.getOrderBook(sym),
    { fetchOnMount: !!symbol }
  );
}

export function useBalances() {
  return useApi(api.getBalances.bind(api), { fetchOnMount: true });
}

export function useOrders(status?: string) {
  return useApi(
    (st?: string) => api.getOrders(st),
    { fetchOnMount: true }
  );
}

export function useTransactions() {
  return useApi(api.getTransactions.bind(api), { fetchOnMount: true });
}

export default useApi;
