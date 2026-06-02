import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Settings,
  CheckCircle,
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  Eye,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { pageVariants, cardVariants } from '@/lib/motion';
import { apiClient, authenticatedFetch } from '@/lib/utils/api-client';
import { useToast } from '@/hooks/useToast';

interface LangStat {
  code: string;
  name: string;
  flag?: string;
  completeness: number;
}
interface NsStat {
  name: string;
  keyCount: number;
  completeness: number;
}
interface ApiKey {
  key: string;
  namespace: string;
  translations: Record<string, string>;
}

const exportFormats = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Nested language bundle: { "en": { "auth": { "login": "…" } } }',
    icon: FileJson,
    extension: '.json',
  },
  {
    id: 'json-flat',
    name: 'JSON (Flat)',
    description: 'Flat keys per language: { "en": { "auth.login": "…" } }',
    icon: FileJson,
    extension: '.json',
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'One row per key, one column per language',
    icon: FileSpreadsheet,
    extension: '.csv',
  },
];

export default function ExportPage() {
  const { slug } = useParams();
  const toast = useToast();
  const [step, setStep] = useState<'configure' | 'preview' | 'exporting' | 'complete'>('configure');
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<LangStat[]>([]);
  const [namespaces, setNamespaces] = useState<NsStat[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [exportConfig, setExportConfig] = useState({
    format: 'json',
    languages: [] as string[],
    namespaces: [] as string[],
    includeEmptyTranslations: false,
    minifyOutput: false,
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedContent, setExportedContent] = useState('');

  const selectedFormat = exportFormats.find((f) => f.id === exportConfig.format);
  const fileName = `${slug}-translations${selectedFormat?.extension || '.json'}`;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const proj = await apiClient.get(`/api/projects/${slug}`);
        const projectId = proj.project?._id;
        const [langData, nsData, keysData] = await Promise.all([
          apiClient.get('/api/languages'),
          apiClient.get(`/api/projects/${slug}/namespaces`),
          apiClient.get(`/api/translations/keys?projectId=${projectId}`),
        ]);

        const allKeys: ApiKey[] = keysData.keys || [];
        const allLangs = langData.languages || [];
        const total = allKeys.length;

        const langStats: LangStat[] = allLangs.map((l: any) => {
          const filled = allKeys.filter((k) => (k.translations?.[l.code] || '').trim() !== '').length;
          return {
            code: l.code,
            name: l.name,
            flag: l.flag,
            completeness: total ? Math.round((filled / total) * 100) : 0,
          };
        });

        const nsStats: NsStat[] = (nsData.namespaces || []).map((n: any) => {
          const nsKeys = allKeys.filter((k) => k.namespace === n.name);
          const cells = nsKeys.length * (allLangs.length || 1);
          const filled = nsKeys.reduce(
            (sum, k) => sum + allLangs.filter((l: any) => (k.translations?.[l.code] || '').trim() !== '').length,
            0
          );
          return {
            name: n.name,
            keyCount: typeof n.keys === 'number' ? n.keys : nsKeys.length,
            completeness: cells ? Math.round((filled / cells) * 100) : 0,
          };
        });

        setKeys(allKeys);
        setLanguages(langStats);
        setNamespaces(nsStats);
        setExportConfig((prev) => ({ ...prev, languages: langStats.map((l) => l.code) }));
      } catch (err: any) {
        toast.error(err.message || 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleExport = async () => {
    setStep('exporting');
    setExportProgress(30);
    try {
      const params = new URLSearchParams({
        format: exportConfig.format,
        languages: exportConfig.languages.join(','),
        namespaces: exportConfig.namespaces.join(','),
        includeEmpty: String(exportConfig.includeEmptyTranslations),
        minify: String(exportConfig.minifyOutput),
      });
      const res = await authenticatedFetch(`/api/projects/${slug}/export?${params.toString()}`);
      setExportProgress(80);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Export failed');
      }
      const text = await res.text();
      setExportedContent(text);
      setExportProgress(100);
      setStep('complete');
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
      setStep('preview');
    }
  };

  const downloadFile = () => {
    const blob = new Blob([exportedContent], {
      type: exportConfig.format === 'csv' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateLanguages = (code: string, checked: boolean) => {
    setExportConfig((prev) => ({
      ...prev,
      languages: checked ? [...prev.languages, code] : prev.languages.filter((l) => l !== code),
    }));
  };

  const updateNamespaces = (ns: string, checked: boolean) => {
    setExportConfig((prev) => ({
      ...prev,
      namespaces: checked ? [...prev.namespaces, ns] : prev.namespaces.filter((n) => n !== ns),
    }));
  };

  const selectedKeyCount =
    exportConfig.namespaces.length > 0
      ? namespaces.filter((n) => exportConfig.namespaces.includes(n.name)).reduce((t, n) => t + n.keyCount, 0)
      : keys.length;

  // Build a small live sample for the preview from real data.
  const sampleText = (() => {
    const langs = exportConfig.languages.length ? exportConfig.languages : languages.map((l) => l.code);
    const sampleKeys = (
      exportConfig.namespaces.length
        ? keys.filter((k) => exportConfig.namespaces.includes(k.namespace))
        : keys
    ).slice(0, 3);
    if (sampleKeys.length === 0) return '// No keys to export yet';

    if (exportConfig.format === 'csv') {
      const header = ['key', ...langs].join(',');
      const rows = sampleKeys.map((k) => [k.key, ...langs.map((l) => k.translations?.[l] || '')].join(','));
      return [header, ...rows].join('\n');
    }
    if (exportConfig.format === 'json-flat') {
      const obj: Record<string, Record<string, string>> = {};
      langs.forEach((l) => {
        obj[l] = {};
        sampleKeys.forEach((k) => (obj[l][k.key] = k.translations?.[l] || ''));
      });
      return JSON.stringify(obj, null, 2);
    }
    // nested
    const obj: Record<string, any> = {};
    langs.forEach((l) => {
      obj[l] = {};
      sampleKeys.forEach((k) => {
        const parts = k.key.split('.');
        let node = obj[l];
        parts.forEach((p, i) => {
          if (i === parts.length - 1) node[p] = k.translations?.[l] || '';
          else node = node[p] = node[p] || {};
        });
      });
    });
    return JSON.stringify(obj, null, 2);
  })();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/projects/${slug}/keys`} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Export Translations</h1>
            <p className="mt-2 text-muted-foreground">Export translations from {slug} in various formats</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-8">
              {[
                { id: 'configure', label: 'Configure', icon: Settings },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'exporting', label: 'Export', icon: RefreshCw },
                { id: 'complete', label: 'Download', icon: Download },
              ].map((stepItem) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.id;
                const isCompleted =
                  ['configure', 'preview'].includes(stepItem.id) && ['exporting', 'complete'].includes(step);
                return (
                  <div key={stepItem.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isActive
                          ? 'bg-brand text-brand-foreground'
                          : isCompleted
                          ? 'bg-success text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {stepItem.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{
                width:
                  step === 'configure' ? '25%' : step === 'preview' ? '50%' : step === 'exporting' ? '75%' : '100%',
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'configure' && (
            <motion.div key="configure" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              {/* Export Format */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Export Format</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = exportConfig.format === format.id;
                    return (
                      <div
                        key={format.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected ? 'border-brand bg-brand/5' : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setExportConfig({ ...exportConfig, format: format.id })}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-brand' : 'text-muted-foreground'}`} />
                          <h3 className="font-medium">{format.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{format.description}</p>
                        <span className="bg-muted px-2 py-1 rounded text-xs text-muted-foreground">{format.extension}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Languages</h2>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No languages configured.</p>
                ) : (
                  <div className="space-y-3">
                    {languages.map((language) => (
                      <div key={language.code} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={exportConfig.languages.includes(language.code)}
                            onChange={(e) => updateLanguages(language.code, e.target.checked)}
                            className="rounded border-border accent-[hsl(var(--brand))]"
                          />
                          {language.flag && <span className="text-lg">{language.flag}</span>}
                          <div>
                            <p className="font-medium">{language.name}</p>
                            <p className="text-sm text-muted-foreground">{language.code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{language.completeness}%</p>
                          <div className="w-20 bg-muted rounded-full h-2 mt-1">
                            <div className="bg-brand h-2 rounded-full" style={{ width: `${language.completeness}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Namespaces */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Namespaces</h2>
                  {namespaces.length > 0 && (
                    <button
                      onClick={() => {
                        if (exportConfig.namespaces.length === namespaces.length) {
                          setExportConfig({ ...exportConfig, namespaces: [] });
                        } else {
                          setExportConfig({ ...exportConfig, namespaces: namespaces.map((n) => n.name) });
                        }
                      }}
                      className="text-sm text-brand hover:underline"
                    >
                      {exportConfig.namespaces.length === namespaces.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {namespaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No namespaces yet.</p>
                ) : (
                  <div className="space-y-3">
                    {namespaces.map((namespace) => (
                      <div key={namespace.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={exportConfig.namespaces.includes(namespace.name)}
                            onChange={(e) => updateNamespaces(namespace.name, e.target.checked)}
                            className="rounded border-border accent-[hsl(var(--brand))]"
                          />
                          <div>
                            <p className="font-medium">{namespace.name}</p>
                            <p className="text-sm text-muted-foreground">{namespace.keyCount} keys</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{namespace.completeness}%</p>
                          <div className="w-20 bg-muted rounded-full h-2 mt-1">
                            <div className="bg-brand h-2 rounded-full" style={{ width: `${namespace.completeness}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {exportConfig.namespaces.length === 0 && namespaces.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">No namespaces selected. All namespaces will be included.</p>
                )}
              </div>

              {/* Options */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Export Options</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeEmptyTranslations"
                      checked={exportConfig.includeEmptyTranslations}
                      onChange={(e) => setExportConfig({ ...exportConfig, includeEmptyTranslations: e.target.checked })}
                      className="rounded border-border accent-[hsl(var(--brand))]"
                    />
                    <label htmlFor="includeEmptyTranslations" className="text-sm">
                      Include keys with empty translations
                    </label>
                  </div>

                  {exportConfig.format.startsWith('json') && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="minifyOutput"
                        checked={exportConfig.minifyOutput}
                        onChange={(e) => setExportConfig({ ...exportConfig, minifyOutput: e.target.checked })}
                        className="rounded border-border accent-[hsl(var(--brand))]"
                      />
                      <label htmlFor="minifyOutput" className="text-sm">
                        Minify JSON output
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep('preview')} disabled={exportConfig.languages.length === 0 || loading}>
                  Preview Export
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Export Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-brand">{selectedKeyCount}</p>
                    <p className="text-sm text-muted-foreground">Total Keys</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-brand">{exportConfig.languages.length}</p>
                    <p className="text-sm text-muted-foreground">Languages</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-brand">{exportConfig.namespaces.length || namespaces.length}</p>
                    <p className="text-sm text-muted-foreground">Namespaces</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Format:</strong>
                    <span>{selectedFormat?.name} ({selectedFormat?.extension})</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <strong>Languages:</strong>
                    <div className="flex flex-wrap gap-2">
                      {exportConfig.languages.map((code) => {
                        const lang = languages.find((l) => l.code === code);
                        return (
                          <span key={code} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                            {lang?.flag && <span>{lang.flag}</span>}
                            <span>{lang?.name || code}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Sample Output</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">{sampleText}</pre>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep('configure')} className="px-4 py-2 border border-border rounded-md hover:bg-accent">
                  Back
                </button>
                <Button onClick={handleExport}>Start Export</Button>
              </div>
            </motion.div>
          )}

          {step === 'exporting' && (
            <motion.div key="exporting" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-brand/10 rounded-full">
                    <Package className="h-8 w-8 text-brand animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Generating Export</h2>
                  <p className="text-muted-foreground">Preparing your translations for download…</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-brand h-2 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div key="complete" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-success/10 rounded-full">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Export Complete!</h2>
                  <p className="text-muted-foreground">Your translations are ready for download</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {selectedFormat && <selectedFormat.icon className="h-5 w-5" />}
                      <span className="font-medium">{fileName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedKeyCount} keys {'•'} {exportConfig.languages.length} languages {'•'}{' '}
                      {(exportedContent.length / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={downloadFile}>
                      <Download className="h-4 w-4" />
                      Download File
                    </Button>
                    <button
                      onClick={() => {
                        setStep('configure');
                        setExportProgress(0);
                        setExportedContent('');
                      }}
                      className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                    >
                      Export Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
