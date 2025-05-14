import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
  [key: string]: any;
}

// Create a wrapper function that adapts our toast calls to work with Sonner
export const toast = (props: ToastProps | string) => {
  // If props is a string, use it as the content
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  
  const { title, description, variant, ...rest } = props;
  
  // For destructive variant, use error
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...rest
    });
  }
  
  // Otherwise use default toast with title and description
  return sonnerToast(title, {
    description,
    ...rest
  });
}

export function useToast() {
  return {
    toast
  }
}
