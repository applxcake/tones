
// Import directly from the toast package
import { toast } from "sonner";

// Re-export the hook and the toast function
export { toast };

// Simple hook to provide toast functionality
export function useToast() {
  return {
    toast
  };
}
