import { showToast } from '@/components/ui/Toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant }: ToastOptions) {
  const type = variant === 'destructive' ? 'error' : 'success';
  showToast(type, title, description);
}
