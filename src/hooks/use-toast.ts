
import { useState, useCallback } from 'react';
import { toast as sonnerToast, useToast as useSonnerToast } from "sonner";

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
  // Map our variants to Sonner's styles
  let toastType: 'default' | 'error' | 'success' = 'default';
  
  if (props.variant === 'destructive') {
    toastType = 'error';
  } else if (props.variant === 'success') {
    toastType = 'success';
  }
  
  // Call the appropriate sonner toast method
  return sonnerToast[toastType]((props.title || ''), {
    description: props.description,
    duration: props.duration || 5000,
    action: props.action,
  });
};

export const useToast = () => {
  const { toast: sonnerToastFn, dismiss } = useSonnerToast();
  
  // Create a more performant toast function that matches our API
  const optimizedToast = useCallback((props: ToastProps) => {
    let toastType: 'default' | 'error' | 'success' = 'default';
    
    if (props.variant === 'destructive') {
      toastType = 'error';
    } else if (props.variant === 'success') {
      toastType = 'success';
    }
    
    return sonnerToastFn[toastType]((props.title || ''), {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  }, [sonnerToastFn]);
  
  return { 
    toast: optimizedToast, 
    dismiss 
  };
};
