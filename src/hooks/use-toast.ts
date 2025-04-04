import { toast } from "sonner"

type ToastOptions = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export function useToast() {
  function showToast(options: ToastOptions) {
    if (options.variant === "destructive") {
      toast.error(options.title || "", {
        description: options.description,
        action: options.action,
        duration: options.duration,
      })
    } else {
      toast(options.title || "", {
        description: options.description,
        action: options.action,
        duration: options.duration,
      })
    }
  }

  return { toast: showToast, showToast }
} 