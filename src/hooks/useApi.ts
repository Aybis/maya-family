import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    retry,
  };
}

export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall(params);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}