import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Settings,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { pageVariants, cardVariants } from '@/lib/motion';
import { apiClient } from '@/lib/utils/api-client';
import { useToast } from '@/hooks/useToast';

interface Conflict {
  keyPath: string;
  language: string;
  current: string;
  incoming: string;
}
interface ImportPreview {
  totalKeys: number;
  newKeys: number;
  updatedKeys: number;
  languages: string[];
  conflicts: Conflict[];
  sample: { keyPath: string; namespace: string; translations: Record<string, string> }[];
}
interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
}

const supportedFormats = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Language bundle — top-level language codes, then nested or flat keys',
    icon: FileJson,
    example: '{\n  "en": { "auth": { "login": "Sign In" } },\n  "es": { "auth": { "login": "Iniciar Sesión" } }\n}',
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'First column is the key, one column per language code',
    icon: FileSpreadsheet,
    example: 'key,en,es,fr\nauth.login,Sign In,Iniciar Sesión,Se connecter',
  },
];

function formatFromName(name: string): string {
  if (name.toLowerCase().endsWith('.csv')) return 'csv';
  return 'json';
}

export default function ImportPage() {
  const { slug } = useParams();
  const toast = useToast();
  const [step, setStep] = useState<'upload' | 'configure' | 'preview' | 'importing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importConfig, setImportConfig] = useState({
    format: 'json',
    conflictResolution: 'replace' as 'replace' | 'skip',
    createMissingKeys: true,
    namespace: '',
  });
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setFile = (file: File) => {
    setSelectedFile(file);
    setImportConfig((prev) => ({ ...prev, format: formatFromName(file.name) }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const continueToConfig = async () => {
    if (!selectedFile) return;
    try {
      const text = await selectedFile.text();
      setFileContent(text);
      setStep('configure');
    } catch {
      toast.error('Could not read the file');
    }
  };

  const runPreview = async () => {
    setBusy(true);
    try {
      const data = await apiClient.post(`/api/projects/${slug}/import/preview`, {
        format: importConfig.format,
        content: fileContent,
      });
      if (data.success) {
        setPreview(data);
        setStep('preview');
      } else {
        toast.error(data.error || 'Could not preview the file');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not preview the file');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    setStep('importing');
    try {
      const data = await apiClient.post(`/api/projects/${slug}/import/apply`, {
        format: importConfig.format,
        content: fileContent,
        namespace: importConfig.namespace || undefined,
        conflictResolution: importConfig.conflictResolution,
        createMissingKeys: importConfig.createMissingKeys,
      });
      if (data.success) {
        setResult(data);
        setStep('complete');
      } else {
        toast.error(data.error || 'Import failed');
        setStep('preview');
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
      setStep('preview');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/projects/${slug}/keys`} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Import Translations</h1>
            <p className="mt-2 text-muted-foreground">Import translations from files into {slug}</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-8">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'configure', label: 'Configure', icon: Settings },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'importing', label: 'Import', icon: RefreshCw },
                { id: 'complete', label: 'Complete', icon: CheckCircle },
              ].map((stepItem) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.id;
                const isCompleted =
                  ['upload', 'configure', 'preview'].includes(stepItem.id) && ['importing', 'complete'].includes(step);
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
                  step === 'upload'
                    ? '20%'
                    : step === 'configure'
                    ? '40%'
                    : step === 'preview'
                    ? '60%'
                    : step === 'importing'
                    ? '80%'
                    : '100%',
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Supported Formats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportedFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div key={format.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="h-5 w-5 text-brand" />
                          <h3 className="font-medium">{format.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{format.description}</p>
                        <pre className="text-xs bg-muted p-2 rounded block overflow-x-auto whitespace-pre">{format.example}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Upload File</h2>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-brand bg-brand/5' : 'border-muted-foreground/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="p-3 bg-success/10 rounded-full">
                          <FileText className="h-8 w-8 text-success" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={continueToConfig}>Continue</Button>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="p-3 bg-muted rounded-full">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drop your file here</p>
                        <p className="text-muted-foreground">or click to browse</p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                      >
                        Choose File
                      </button>
                      <input ref={fileInputRef} type="file" className="hidden" accept=".json,.csv" onChange={handleFileSelect} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'configure' && (
            <motion.div key="configure" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Import Configuration</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="format" className="block text-sm font-medium mb-2">File Format</label>
                  <select
                    id="format"
                    className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    value={importConfig.format}
                    onChange={(e) => setImportConfig({ ...importConfig, format: e.target.value })}
                  >
                    {supportedFormats.map((format) => (
                      <option key={format.id} value={format.id}>{format.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="namespace" className="block text-sm font-medium mb-2">Target Namespace (Optional)</label>
                  <input
                    id="namespace"
                    type="text"
                    className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    value={importConfig.namespace}
                    onChange={(e) => setImportConfig({ ...importConfig, namespace: e.target.value })}
                    placeholder="e.g., auth, navigation"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to derive the namespace from each key path.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conflict Resolution</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="replace"
                        checked={importConfig.conflictResolution === 'replace'}
                        onChange={() => setImportConfig({ ...importConfig, conflictResolution: 'replace' })}
                        className="accent-[hsl(var(--brand))]"
                      />
                      <label htmlFor="replace" className="text-sm">Replace existing translations</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="skip"
                        checked={importConfig.conflictResolution === 'skip'}
                        onChange={() => setImportConfig({ ...importConfig, conflictResolution: 'skip' })}
                        className="accent-[hsl(var(--brand))]"
                      />
                      <label htmlFor="skip" className="text-sm">Skip existing translations (only fill empty)</label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createMissingKeys"
                    checked={importConfig.createMissingKeys}
                    onChange={(e) => setImportConfig({ ...importConfig, createMissingKeys: e.target.checked })}
                    className="accent-[hsl(var(--brand))]"
                  />
                  <label htmlFor="createMissingKeys" className="text-sm">Create missing translation keys</label>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep('upload')} className="px-4 py-2 border border-border rounded-md hover:bg-accent">
                    Back
                  </button>
                  <Button onClick={runPreview} disabled={busy}>{busy ? 'Analyzing…' : 'Preview Import'}</Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'preview' && preview && (
            <motion.div key="preview" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Import Preview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-brand">{preview.totalKeys}</p>
                    <p className="text-sm text-muted-foreground">Total Keys</p>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <p className="text-2xl font-bold text-success">{preview.newKeys}</p>
                    <p className="text-sm text-muted-foreground">New Keys</p>
                  </div>
                  <div className="text-center p-4 bg-brand/10 rounded-lg">
                    <p className="text-2xl font-bold text-brand">{preview.updatedKeys}</p>
                    <p className="text-sm text-muted-foreground">Existing Keys</p>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <p className="text-2xl font-bold text-warning">{preview.conflicts.length}</p>
                    <p className="text-sm text-muted-foreground">Conflicts</p>
                  </div>
                </div>
                {preview.languages.length > 0 && (
                  <p className="text-sm text-muted-foreground">Languages: {preview.languages.join(', ')}</p>
                )}
              </div>

              {preview.conflicts.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold">Conflicts Detected</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    These keys already have a different translation. They will be{' '}
                    <span className="font-medium text-foreground">
                      {importConfig.conflictResolution === 'replace' ? 'replaced' : 'skipped'}
                    </span>{' '}
                    based on your conflict-resolution setting.
                  </p>
                  <div className="space-y-4">
                    {preview.conflicts.slice(0, 25).map((conflict, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="mb-3">
                          <p className="font-medium">{conflict.keyPath}</p>
                          <p className="text-sm text-muted-foreground uppercase">{conflict.language}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Current</p>
                            <p className="text-sm p-2 bg-muted/50 rounded">{conflict.current}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Incoming</p>
                            <p className="text-sm p-2 bg-brand/5 border border-brand/20 rounded">{conflict.incoming}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {preview.conflicts.length > 25 && (
                      <p className="text-sm text-muted-foreground">+ {preview.conflicts.length - 25} more conflicts…</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Sample Data</h3>
                <div className="space-y-3">
                  {preview.sample.map((item, index) => (
                    <div key={index} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm">{item.keyPath}</span>
                        <span className="text-xs text-muted-foreground">{item.namespace}</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(item.translations).map(([lang, text]) => (
                          <div key={lang} className="flex items-center gap-2 text-sm">
                            <span className="w-6 text-muted-foreground uppercase">{lang}:</span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep('configure')} className="px-4 py-2 border border-border rounded-md hover:bg-accent">
                  Back
                </button>
                <Button onClick={handleImport} disabled={preview.totalKeys === 0}>Start Import</Button>
              </div>
            </motion.div>
          )}

          {step === 'importing' && (
            <motion.div key="importing" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-brand/10 rounded-full">
                    <RefreshCw className="h-8 w-8 text-brand animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Importing Translations</h2>
                  <p className="text-muted-foreground">Please wait while we import your translations…</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'complete' && result && (
            <motion.div key="complete" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-success/10 rounded-full">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Import Complete!</h2>
                  <p className="text-muted-foreground">Processed {result.total} translation keys</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-lg font-bold text-success">{result.created}</p>
                    <p className="text-sm text-muted-foreground">Keys Created</p>
                  </div>
                  <div className="p-4 bg-brand/10 rounded-lg">
                    <p className="text-lg font-bold text-brand">{result.updated}</p>
                    <p className="text-sm text-muted-foreground">Keys Updated</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-muted-foreground">{result.skipped}</p>
                    <p className="text-sm text-muted-foreground">Keys Skipped</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link to={`/projects/${slug}/keys`}>View Translations</Link>
                  </Button>
                  <button
                    onClick={() => {
                      setStep('upload');
                      setSelectedFile(null);
                      setFileContent('');
                      setPreview(null);
                      setResult(null);
                    }}
                    className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                  >
                    Import More
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
