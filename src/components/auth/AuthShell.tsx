import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/** Shared branded shell for auth screens (login, signup, setup). */
export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-brand">
            <Languages className="h-6 w-6 text-brand-foreground" />
          </div>
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          )}
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-7">{children}</div>

        <p className="mt-6 text-center text-xs text-muted-foreground">Koto — Translation Platform</p>
      </div>
    </motion.div>
  );
}

export default AuthShell;
