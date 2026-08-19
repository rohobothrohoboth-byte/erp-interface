// hooks/useToast.ts
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { showToast } from '@/shared/layout/layout';

const useToast = () => {
  const success = useCallback((message: string, options = {}) => {
    showToast.success(message, options);
  }, []);

  const error = useCallback((message: string, options = {}) => {
    showToast.error(message, options);
  }, []);

  const loading = useCallback((message: string, options = {}) => {
    return showToast.loading(message, options);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    showToast.dismiss(toastId);
  }, []);

  const promise = useCallback(<T,>(
    promise: Promise<T>, 
    messages: { loading: string; success: string; error: string }, 
    options = {}
  ) => {
    return showToast.promise(promise, messages, options);
  }, []);

  const custom = useCallback((message: string, options = {}) => {
    showToast.custom(message, options);
  }, []);

  return {
    success,
    error,
    loading,
    dismiss,
    promise,
    custom,
    toast, // Direct access to original toast object if needed
  };
};

export default useToast;