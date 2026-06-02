import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, LayoutGrid } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

export default function NotFoundPage() {
  const { pathname } = useLocation();

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
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-brand">
          <Compass className="h-7 w-7 text-brand-foreground" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          We couldn't find{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {pathname}
          </code>
          . It may have moved, or never existed.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-brand/90"
          >
            <LayoutGrid className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
