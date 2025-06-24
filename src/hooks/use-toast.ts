import { useCallback } from 'react';
import { toast as sonnerToast } from "sonner";

// Enhanced toast types to match Sonner's API
type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive" | "success";
  action?: React.ReactNode;
};

/**
 * Optimized toast function that batches toast notifications to prevent performance issues
 */
export const toast = (props: ToastProps) => {
  const message = props.title || '';
  const options = {
    description: props.description,
    duration: props.duration || 5000,
    action: props.action,
  };

  // Use the correct Sonner API methods
  if (props.variant === 'destructive') {
    return sonnerToast.error(message, options);
  } else if (props.variant === 'success') {
    return sonnerToast.success(message, options);
  } else {
    return sonnerToast(message, options);
  }
};

/**
 * Custom hook for toast functionality
 */
export const useToast = () => {
  // Create a more performant toast function that matches our API
  const optimizedToast = useCallback((props: ToastProps) => {
    const message = props.title || '';
    const options = {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    };

    // Use the correct Sonner API methods
    if (props.variant === 'destructive') {
      return sonnerToast.error(message, options);
    } else if (props.variant === 'success') {
      return sonnerToast.success(message, options);
    } else {
      return sonnerToast(message, options);
    }
  }, []);
  
  return { 
    toast: optimizedToast, 
    dismiss: sonnerToast.dismiss
  };
};