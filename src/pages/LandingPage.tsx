import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Languages,
  Github,
  Key,
  FolderTree,
  GitBranch,
  Users,
  ArrowLeftRight,
  Code2,
  ArrowRight,
  Check,
  CircleDot,
  Circle,
  Terminal,
} from 'lucide-react';

const GH = 'https://github.com/kea0811';

const features = [
  { icon: Key, title: 'Translation keys & namespaces', desc: 'Organize strings by key path and namespace, with completion tracking per locale.' },
  { icon: Languages, title: 'Any number of locales', desc: 'Manage 40+ languages from one workspace — source, review, and missing states at a glance.' },
  { icon: GitBranch, title: 'Versions & environments', desc: 'Snapshot translations into versions and promote them across environments.' },
  { icon: Users, title: 'Teams & approvals', desc: 'Invite members, assign projects, and gate changes behind an approval queue.' },
  { icon: ArrowLeftRight, title: 'Import & export', desc: 'Round-trip your translations as JSON or CSV — bring existing locales in, take them out anytime.' },
  { icon: Code2, title: 'SDKs & REST API', desc: 'Fetch translations at runtime with a scoped API key from the official client libraries.' },
];

const sdks = [
  { name: 'kotomot-react', desc: 'React hook + provider with IndexedDB caching.', install: 'npm install kotomot-react', repo: 'kotomot-react', pkg: { label: 'npm', url: 'https://www.npmjs.com/package/kotomot-react' } },
  { name: 'kotomot-react-native', desc: 'React Native client with AsyncStorage persistence.', install: 'npm install kotomot-react-native', repo: 'kotomot-react-native', pkg: { label: 'npm', url: 'https://www.npmjs.com/package/kotomot-react-native' } },
  { name: 'kotomot-node-sdk', desc: 'Node.js SDK for servers, CLIs, and build tooling.', install: 'npm install kotomot-node-sdk', repo: 'kotomot-node-sdk', pkg: { label: 'npm', url: 'https://www.npmjs.com/package/kotomot-node-sdk' } },
  { name: 'kotomot_flutter', desc: 'Flutter/Dart provider — cache-first loading & runtime locale switching.', install: 'flutter pub add kotomot_flutter', repo: 'kotomot-flutter', pkg: null as { label: string; url: string } | null },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-brand">
              <Languages className="h-[18px] w-[18px] text-brand-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Kotomot</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">Features</a>
            <a href="#sdks" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">SDKs</a>
            <a href="#opensource" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">Open source</a>
            <a href={`${GH}/kotomot-frontend`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <Link to="/login" className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-brand/90">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Open-source · MIT licensed
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Ship every language, faster.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Kotomot is an open-source translation-management platform. Manage keys across projects,
              locales, versions and environments — then ship them to any app with a typed SDK.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/login" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground shadow-sm transition-all hover:bg-brand/90 active:scale-[0.99]">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`${GH}/kotomot-frontend`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-accent">
                <Github className="h-4 w-4" /> View on GitHub
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Kotomot</span> — <span className="italic">koto</span> (言, Japanese for “word”) + <span className="italic">mot</span> (French for “word”). Words meeting words: that is translation.
            </p>
          </motion.div>

          {/* Mini translation card preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">auth.login.title</span>
                <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">In review</span>
              </div>
              {[
                { n: 'en · English', icon: Check, c: 'text-success' },
                { n: 'fr · Français', icon: Check, c: 'text-success' },
                { n: 'de · Deutsch', icon: Check, c: 'text-success' },
                { n: 'es · Español', icon: CircleDot, c: 'text-warning' },
                { n: 'ja · 日本語', icon: Circle, c: 'text-muted-foreground' },
              ].map(({ n, icon: Icon, c }) => (
                <div key={n} className="flex items-center justify-between border-t border-border/60 pt-3 first:border-0 first:pt-0">
                  <span className="text-sm text-muted-foreground">{n}</span>
                  <Icon className={`h-4 w-4 ${c}`} />
                </div>
              ))}
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: '72%' }} />
              </div>
              <span className="text-xs text-muted-foreground">72% translated · 5 locales</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Everything to localize a product</h2>
        <p className="mt-2 text-muted-foreground">From the first key to a versioned release across teams.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SDKs */}
      <section id="sdks" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Official client libraries</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Install a Kotomot SDK, point it at your API URL with a key you generate in the dashboard, and your
            app pulls live translations — no rebuilds.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sdks.map((s) => (
              <div key={s.name} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-brand" />
                  <code className="text-sm font-semibold">{s.name}</code>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.desc}</p>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-muted px-3 py-2 text-xs text-foreground">{s.install}</pre>
                <div className="mt-3 flex gap-4 text-xs">
                  {s.pkg && (
                    <a href={s.pkg.url} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{s.pkg.label}</a>
                  )}
                  <a href={`${GH}/${s.repo}`} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">GitHub</a>
                </div>
              </div>
            ))}
          </div>
          <pre className="mt-8 overflow-x-auto rounded-xl border border-border bg-background p-5 text-xs leading-relaxed text-muted-foreground">
{`import { KotoProvider } from 'kotomot-react';

<KotoProvider
  apiUrl="https://api.kotomot.app/v1/translations"
  apiKey={import.meta.env.VITE_KOTOMOT_KEY}   // generated in the dashboard
  projectId="your-project"
>
  <App />
</KotoProvider>`}
          </pre>
        </div>
      </section>

      {/* Open source / self-host */}
      <section id="opensource" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight">Free, open source, and self-hostable</h2>
              <p className="mt-2 text-muted-foreground">
                Kotomot is MIT licensed. Use the hosted version, or clone the repos and run your own —
                React + Vite frontend, an Express + MongoDB API, and Supabase for auth.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href={`${GH}/kotomot-frontend`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent">
                <span className="flex items-center gap-2"><Github className="h-4 w-4" /> kotomot-frontend</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </a>
              <a href={`${GH}/kotomot-backend`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent">
                <span className="flex items-center gap-2"><Github className="h-4 w-4" /> kotomot-backend</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand">
              <Languages className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <span>Kotomot — open-source translation management.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`${GH}/kotomot-frontend`} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            <span>MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
