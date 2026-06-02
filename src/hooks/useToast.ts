import { showToast as showToastFn, ToastType } from '@/components/ui/Toast';

export function useToast() {
  const toast = {
    success: (title: string, message?: string) => {
      showToastFn('success', title, message);
    },
    error: (title: string, message?: string) => {
      showToastFn('error', title, message);
    },
    info: (title: string, message?: string) => {
      showToastFn('info', title, message);
    },
    warning: (title: string, message?: string) => {
      showToastFn('warning', title, message);
    },
  };

  return toast;
}
