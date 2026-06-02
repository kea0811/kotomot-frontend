import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

interface SdkMeta {
  name: string;
  tagline: string;
  install: string;
}

const SDKS: Record<string, SdkMeta> = {
  'nodejs-sdk': {
    name: 'Node.js SDK',
    tagline: 'Server-side translation management for Node.js applications.',
    install: 'npm install @koto/node',
  },
  'koto-react': {
    name: 'React SDK',
    tagline: 'Hooks and components to load and render translations in React.',
    install: 'npm install @koto/react',
  },
  'koto-react-native': {
    name: 'React Native SDK',
    tagline: 'Localize your mobile app with the Koto React Native SDK.',
    install: 'npm install @koto/react-native',
  },
};

export default function SdkDocsPage() {
  const { sdk = '' } = useParams();
  const meta = SDKS[sdk];

  // Unknown SDK slug — keep it friendly and on-brand.
  const title = meta?.name ?? 'SDK Documentation';
  const tagline =
    meta?.tagline ?? 'Documentation for this SDK is on the way.';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Book className="h-7 w-7" />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
          <Clock className="h-3.5 w-3.5" />
          Coming soon
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{tagline}</p>

        {meta && (
          <div className="mt-6 flex items-center justify-center">
            <code className="rounded-lg border border-border bg-muted px-4 py-2 font-mono text-sm text-foreground">
              {meta.install}
            </code>
          </div>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          We're writing the full guides and API reference. In the meantime, you can{' '}
          <Link to="/projects" className="font-medium text-brand hover:opacity-80">
            create a project
          </Link>{' '}
          and start adding translation keys.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent"
          >
            <ExternalLink className="h-4 w-4" />
            Explore integrations
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
