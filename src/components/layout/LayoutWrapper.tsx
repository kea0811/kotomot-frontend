import { useLocation } from 'react-router-dom';
import AppLayout from './AppLayout';

const NO_LAYOUT_PATHS = ['/login', '/setup'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;

  const shouldShowLayout = !NO_LAYOUT_PATHS.includes(pathname || '');

  return shouldShowLayout ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <>{children}</>
  );
}
