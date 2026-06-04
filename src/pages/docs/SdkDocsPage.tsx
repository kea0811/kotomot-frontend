import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Languages,
  Github,
  ArrowLeft,
  ArrowRight,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

const GH = 'https://github.com/kea0811';

/* ------------------------------------------------------------------ */
/* Content — accurate to each SDK's actual source (not the READMEs).   */
/* ------------------------------------------------------------------ */

interface ConfigRow {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  desc?: string;
}
interface ApiItem {
  sig: string;
  desc: string;
}
interface ApiGroup {
  title: string;
  items: ApiItem[];
}
interface SdkDoc {
  name: string;
  pkg: string;
  lang: string;
  status: 'Stable' | 'Beta';
  tagline: string;
  install: string;
  npm?: string;
  repo: string;
  quickStart: string;
  config: { title: string; rows: ConfigRow[] };
  api: ApiGroup[];
  caching: string;
  notes: string[];
}

const SDKS: Record<string, SdkDoc> = {
  'kotomot-react': {
    name: 'React SDK',
    pkg: 'kotomot-react',
    lang: 'React · TypeScript',
    status: 'Stable',
    tagline:
      'A provider + hooks that load translations at runtime and cache them in IndexedDB, with version-based revalidation.',
    install: 'npm install kotomot-react',
    npm: 'https://www.npmjs.com/package/kotomot-react',
    repo: 'kotomot-react',
    quickStart: `import { KotoProvider, useTranslation } from 'kotomot-react';

function App() {
  return (
    <KotoProvider
      apiKey={import.meta.env.VITE_KOTOMOT_KEY}  // generated in the dashboard
      projectId="your-project"
      defaultLocale="en"
    >
      <Greeting />
    </KotoProvider>
  );
}

function Greeting() {
  const { t, ti, locale, setLocale, loading } = useTranslation();
  if (loading) return <p>Loading…</p>;
  return (
    <>
      <h1>{t('home.hero.title')}</h1>
      <p>{ti('home.greeting', { name: 'Jane' })}</p>   {/* uses {{name}} */}
      <button onClick={() => setLocale('ja')}>日本語</button>
    </>
  );
}`,
    config: {
      title: '<KotoProvider> props',
      rows: [
        { name: 'apiKey', type: 'string', required: true, desc: 'A scoped key from the dashboard.' },
        { name: 'projectId', type: 'string', required: true, desc: 'Project slug or ID.' },
        { name: 'defaultLocale', type: 'string', required: true, desc: 'Initial locale (a persisted choice overrides it).' },
        {
          name: 'apiUrl',
          type: 'string',
          default: 'https://api.kotomot.app',
          desc: 'Bare host or full /v1/translations endpoint — both work.',
        },
      ],
    },
    api: [
      {
        title: 'Hooks',
        items: [
          {
            sig: 'useTranslation()',
            desc: 'Returns { t, ti, tp, locale, loading, setLocale, refresh, availableLocales, getAvailableLocales }.',
          },
          { sig: 'useKoto()', desc: 'Full context: adds translations, error. Throws if used outside a provider.' },
        ],
      },
      {
        title: 'Translating',
        items: [
          { sig: 't(key, fallback?)', desc: 'Looks up a dot-notation key. 2nd arg is a fallback string (not interpolation).' },
          { sig: 'ti(key, params, fallback?)', desc: 'Interpolation — replaces {var} and {{var}} placeholders.' },
          { sig: 'tp(key, count, params?)', desc: 'Pluralization — picks key.zero / key.one / key.other and injects count.' },
        ],
      },
      {
        title: 'Class components',
        items: [
          { sig: 'withTranslation(Component)', desc: 'HOC injecting translation props.' },
          { sig: '<Translation>{(t) => …}</Translation>', desc: 'Render-prop access to t.' },
        ],
      },
      {
        title: 'Standalone (no React)',
        items: [
          { sig: 'initTranslations(locale)', desc: 'Load a cached locale from IndexedDB into the module store.' },
          { sig: 'setTranslations(translations, locale)', desc: 'Seed + persist a translation map.' },
          { sig: 'getLocale()', desc: 'Current module-global locale.' },
        ],
      },
    ],
    caching:
      'IndexedDB (via idb). On load, cached strings are served instantly, then GET /version is compared and the bundle is only refetched when the version changed. The selected locale is persisted to localStorage.',
    notes: [
      'Use ti() for interpolation ({var} or {{var}}); t()’s second argument is a fallback string, not params.',
      'apiUrl accepts the bare host (https://api.kotomot.app); the SDK appends /v1/translations for you.',
    ],
  },

  'kotomot_flutter': {
    name: 'Flutter SDK',
    pkg: 'kotomot_flutter',
    lang: 'Flutter · Dart',
    status: 'Stable',
    tagline:
      'A KotomotProvider plus context.tr/tri/trp extensions — cache-first loading, runtime locale switching, offline fallback.',
    install: 'flutter pub add kotomot_flutter',
    repo: 'kotomot-flutter',
    quickStart: `import 'package:flutter/material.dart';
import 'package:kotomot_flutter/kotomot_flutter.dart';

void main() => runApp(
  KotomotProvider(
    config: KotomotConfig(
      apiKey: const String.fromEnvironment('KOTOMOT_API_KEY'),
      projectId: 'your-project',
      defaultLocale: 'en',
    ),
    child: const MyApp(),
  ),
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    final koto = Kotomot.of(context); // rebuilds on locale change
    if (koto.loading) {
      return const MaterialApp(
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text(context.tr('home.hero.title', fallback: 'Welcome'))),
        body: Center(child: Text(context.tri('home.greeting', {'name': 'Jane'}))),
      ),
    );
  }
}`,
    config: {
      title: 'KotomotConfig parameters',
      rows: [
        { name: 'apiKey', type: 'String', required: true, desc: 'A scoped key from the dashboard.' },
        { name: 'projectId', type: 'String', required: true, desc: 'Project slug or ID.' },
        { name: 'defaultLocale', type: 'String', required: true, desc: 'Initial locale.' },
        { name: 'apiUrl', type: 'String', default: "'https://api.kotomot.app'", desc: 'Bare host or full endpoint.' },
        { name: 'namespace', type: 'String?', desc: 'Optional namespace filter.' },
        { name: 'cacheDuration', type: 'Duration', default: 'Duration(hours: 1)', desc: 'Reserved (cache is currently always background-refreshed).' },
      ],
    },
    api: [
      {
        title: 'In widgets (BuildContext)',
        items: [
          { sig: 'context.tr(key, {fallback})', desc: 'Look up a translation; rebuilds the widget on change.' },
          { sig: 'context.tri(key, params, {fallback})', desc: 'Interpolation — supports both {var} and {{var}}.' },
          { sig: 'context.trp(key, count, {params})', desc: 'Pluralization (key.zero / .one / .other).' },
        ],
      },
      {
        title: 'Controller — Kotomot.of(context)',
        items: [
          { sig: 'setLocale(locale)', desc: 'Switch locale (cache-first + background refresh).' },
          { sig: 'refresh()', desc: 'Force a network refresh of the current locale.' },
          { sig: 'locale · loading · error · version', desc: 'Reactive getters (ChangeNotifier).' },
        ],
      },
      {
        title: 'Global (no widget)',
        items: [
          { sig: 'initTranslations(locale) · setTranslations(...)', desc: 'Process-wide store, separate from a provider.' },
          { sig: 't / ti / tp', desc: 'Same signatures as the widget extensions.' },
        ],
      },
    ],
    caching:
      'shared_preferences, one JSON entry per locale. Cache-first: cached strings render immediately, then a background fetch re-persists. On a network error the cached bundle is kept (offline fallback).',
    notes: [
      'Interpolation accepts both {var} and {{var}} — Kotomot’s own data uses single-brace {var}.',
      'Switch language at runtime with Kotomot.of(context).setLocale(\'zh-hant\').',
      'apiUrl accepts the bare host; the SDK appends /v1/translations.',
    ],
  },

  'kotomot-node-sdk': {
    name: 'Node.js SDK',
    pkg: 'kotomot-node-sdk',
    lang: 'Node.js · TypeScript (CJS)',
    status: 'Stable',
    tagline:
      'A server-side client for reading published translations and importing them back — for SSR, build tooling, and CLIs.',
    install: 'npm install kotomot-node-sdk',
    npm: 'https://www.npmjs.com/package/kotomot-node-sdk',
    repo: 'kotomot-node-sdk',
    quickStart: `const { KotoClient } = require('kotomot-node-sdk');

const koto = new KotoClient({
  apiKey: process.env.KOTOMOT_API_KEY,   // baseUrl defaults to https://api.kotomot.app
});

// A flat map: { 'home.hero.title': 'Welcome', ... }
const translations = await koto.getTranslations('your-project', {
  locale: 'en',
  namespace: 'common',   // optional
});

// Supported locales (for a picker)
const { defaultLocale, locales } = await koto.getLocales('your-project');`,
    config: {
      title: 'new KotoClient(config)',
      rows: [
        { name: 'apiKey', type: 'string', required: true, desc: 'Throws if missing.' },
        { name: 'baseUrl', type: 'string', default: 'https://api.kotomot.app', desc: 'API host.' },
        { name: 'timeout', type: 'number (ms)', default: '30000' },
        { name: 'retryAttempts', type: 'number', default: '3' },
        { name: 'retryDelay', type: 'number (ms)', default: '1000' },
        { name: 'headers', type: 'Record<string,string>', desc: 'Merged into every request.' },
        { name: 'cache', type: 'CacheConfig', default: '{ enabled: true, ttl: 3600 }', desc: "storage: 'memory' | 'redis' | 'custom'." },
      ],
    },
    api: [
      {
        title: 'Read',
        items: [
          { sig: 'getTranslations(projectId, { locale, namespace?, environment? })', desc: 'Published map for a locale → { keyPath: value }.' },
          { sig: 'getVersion(projectId)', desc: 'Current published version string (or null).' },
          { sig: 'getLocales(projectId)', desc: 'Supported locales (source-first) for a picker.' },
        ],
      },
      {
        title: 'Write (needs write:translations)',
        items: [
          { sig: 'importTranslations(projectId, { format, content, namespace?, conflictResolution?, createMissingKeys? })', desc: 'Import a JSON/CSV file’s worth of translations.' },
        ],
      },
      {
        title: 'Also exported',
        items: [
          { sig: 'setLogger(logger)', desc: 'Custom logging.' },
          { sig: 'MemoryCache · CacheManager', desc: 'Cache building blocks.' },
        ],
      },
    ],
    caching:
      'In-process memory cache by default (1h TTL); swap in Redis (cache.storage = "redis") or a custom CacheStorage. Imports clear the cache.',
    notes: [
      'The exported class is KotoClient.',
      'Reads return the published set; environment pins reads to the version deployed to that environment.',
      'Server-side only: depends on node-fetch and ships CommonJS (not browser/edge).',
    ],
  },

  'kotomot-react-native': {
    name: 'React Native SDK',
    pkg: 'kotomot-react-native',
    lang: 'React Native',
    status: 'Stable',
    tagline:
      'A KotoProvider + useTranslation() hook — runtime locale switching and AsyncStorage caching with version-based revalidation.',
    install: 'npm install kotomot-react-native @react-native-async-storage/async-storage',
    npm: 'https://www.npmjs.com/package/kotomot-react-native',
    repo: 'kotomot-react-native',
    quickStart: `import { KotoProvider, useTranslation } from 'kotomot-react-native';

export default function App() {
  return (
    <KotoProvider
      apiKey={process.env.KOTOMOT_API_KEY}   // generated in the dashboard
      projectId="your-project"
      defaultLocale="en"
    >
      <Home />
    </KotoProvider>
  );
}

function Home() {
  const { t, ti, locale, setLocale, loading } = useTranslation();
  if (loading) return <ActivityIndicator />;
  return (
    <View>
      <Text>{t('home.hero.title')}</Text>
      <Text>{ti('home.greeting', { name: 'Jane' })}</Text>   {/* {name} or {{name}} */}
      <Button title="日本語" onPress={() => setLocale('ja')} />
    </View>
  );
}`,
    config: {
      title: '<KotoProvider> props',
      rows: [
        { name: 'apiKey', type: 'string', required: true, desc: 'A scoped key from the dashboard.' },
        { name: 'projectId', type: 'string', required: true, desc: 'Project slug or ID.' },
        { name: 'defaultLocale', type: 'string', required: true, desc: 'Initial locale (a persisted choice overrides it).' },
        { name: 'apiUrl', type: 'string', default: 'https://api.kotomot.app', desc: 'Bare host or full endpoint.' },
        { name: 'namespace', type: 'string', desc: 'Optional namespace filter.' },
      ],
    },
    api: [
      {
        title: 'Hooks',
        items: [
          { sig: 'useTranslation()', desc: 'Returns { t, ti, tp, locale, setLocale, loading, availableLocales, refresh }.' },
          { sig: 'useKoto()', desc: 'Full context: adds translations, error, version.' },
        ],
      },
      {
        title: 'Translating',
        items: [
          { sig: 't(key, fallback?)', desc: 'Look up a dot-notation key.' },
          { sig: 'ti(key, params, fallback?)', desc: 'Interpolation — supports {var} and {{var}}.' },
          { sig: 'tp(key, count, params?)', desc: 'Pluralization (key.zero / .one / .other).' },
          { sig: 'setLocale(code) · availableLocales', desc: 'Switch language (persisted); picker metadata from /v1/locales.' },
        ],
      },
    ],
    caching:
      'AsyncStorage, one entry per locale. Cache-first: cached strings render immediately, then the published version is checked and refetched only if it changed. The selected locale persists across launches.',
    notes: [
      'Requires the @react-native-async-storage/async-storage peer dependency.',
      'Interpolation supports both {var} and {{var}}.',
      'apiUrl accepts the bare host; the SDK appends /v1/translations.',
    ],
  },
};

const ORDER = ['kotomot-react', 'kotomot_flutter', 'kotomot-node-sdk', 'kotomot-react-native'];

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-10">
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto rounded-xl border border-border bg-[#0d1117] p-5 text-xs leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StatusBadge({ status }: { status: 'Stable' | 'Beta' }) {
  const stable = status === 'Stable';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        stable ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${stable ? 'bg-success' : 'bg-warning'}`} />
      {status}
    </span>
  );
}

function Doc({ doc }: { doc: SdkDoc }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{doc.name}</h1>
          <StatusBadge status={doc.status} />
          <span className="text-xs text-muted-foreground">{doc.lang}</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{doc.tagline}</p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-sm">{doc.install}</code>
          <CopyButton text={doc.install} />
          {doc.npm && (
            <a href={doc.npm} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              npm <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <a href={`${GH}/${doc.repo}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Quick start */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Quick start</h2>
        <CodeBlock code={doc.quickStart} />
      </section>

      {/* Configuration */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{doc.config.title}</h2>
        <div className="overflow-hidden overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Default</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.config.rows.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="px-4 py-2.5 font-mono text-xs font-medium text-foreground">
                    {r.name}
                    {r.required && <span className="ml-1 text-brand">*</span>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.type}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.default ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.desc ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground"><span className="text-brand">*</span> required</p>
      </section>

      {/* API */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Exposed API</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {doc.api.map((g) => (
            <div key={g.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{g.title}</h3>
              <ul className="space-y-3">
                {g.items.map((it) => (
                  <li key={it.sig}>
                    <code className="block break-words font-mono text-xs text-brand">{it.sig}</code>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{it.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Caching */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Caching</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{doc.caching}</p>
      </section>

      {/* Notes */}
      <section className="mt-10">
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" /> Good to know
          </h3>
          <ul className="space-y-1.5">
            {doc.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-warning" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </motion.div>
  );
}

function Index() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">SDK documentation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Official client libraries. Pick one to see install, configuration, the exposed API, and an integration example.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ORDER.map((slug) => {
          const d = SDKS[slug];
          return (
            <Link key={slug} to={`/docs/${slug}`} className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-brand" />
                  <code className="text-sm font-semibold">{d.pkg}</code>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{d.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Read docs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SdkDocsPage() {
  const { sdk = '' } = useParams();
  const doc = SDKS[sdk];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-brand">
              <Languages className="h-[18px] w-[18px] text-brand-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Kotomot</span>
            <span className="text-sm text-muted-foreground">/ docs</span>
          </Link>
          <a href={`${GH}/${doc?.repo ?? 'kotomot-frontend'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* SDK switcher */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Link to="/" className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          {ORDER.map((slug) => (
            <Link
              key={slug}
              to={`/docs/${slug}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                slug === sdk ? 'bg-brand text-brand-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {SDKS[slug].pkg}
            </Link>
          ))}
        </div>

        {doc ? <Doc doc={doc} /> : <Index />}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <span>Kotomot — open-source translation management.</span>
          <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
