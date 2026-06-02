import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { pageVariants } from '@/lib/motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import Select from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/button';
import TranslationDetailPanel from '@/components/TranslationDetailPanel';
import { apiClient } from '@/lib/utils/api-client';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  key: string; // keyPath
  namespace: string;
  description: string;
  translations: Record<string, string>;
  completion: number;
  updated_at?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
  direction?: 'ltr' | 'rtl';
}

const statusPill: Record<string, string> = {
  approved: 'bg-success/10 text-success',
  review: 'bg-warning/10 text-warning',
  draft: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<string, string> = {
  approved: 'Complete',
  review: 'In progress',
  draft: 'Empty',
};

function deriveStatus(pct: number): 'approved' | 'review' | 'draft' {
  if (pct >= 100) return 'approved';
  if (pct <= 0) return 'draft';
  return 'review';
}

function completionOf(translations: Record<string, string>, total: number) {
  if (total === 0) return 0;
  const done = Object.values(translations).filter((t) => (t || '').trim() !== '').length;
  return Math.round((done / total) * 100);
}

export default function ProjectKeysPage() {
  const { slug } = useParams();
  const toast = useToast();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [namespaces, setNamespaces] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [namespaceFilter, setNamespaceFilter] = useState('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projData = await apiClient.get(`/api/projects/${slug}`);
      const projectId = projData.project?._id;
      if (!projectId) throw new Error('Project not found');

      const [keysData, langData, nsData] = await Promise.all([
        apiClient.get(`/api/translations/keys?projectId=${projectId}`),
        apiClient.get('/api/languages'),
        apiClient.get(`/api/projects/${slug}/namespaces`),
      ]);

      setKeys(keysData.keys || []);
      setLanguages(langData.languages || []);
      setNamespaces(nsData.namespaces || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load translation keys');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const sourceLanguageCode = languages[0]?.code || 'en';
  const totalLangs = languages.length;

  const filteredKeys = useMemo(() => {
    return keys.filter((key) => {
      const matchesSearch =
        key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const status = deriveStatus(key.completion);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesNamespace = namespaceFilter === 'all' || key.namespace === namespaceFilter;
      return matchesSearch && matchesStatus && matchesNamespace;
    });
  }, [keys, searchQuery, statusFilter, namespaceFilter]);

  const selectedKeyData = selectedKey ? keys.find((k) => k.id === selectedKey) : null;

  const detailKey = useMemo(() => {
    if (!selectedKeyData) return null;
    const statusMap = { approved: 'completed', review: 'review', draft: 'pending' } as const;
    return {
      id: selectedKeyData.id,
      key: selectedKeyData.key,
      namespace: selectedKeyData.namespace,
      description: selectedKeyData.description,
      translations: selectedKeyData.translations,
      status: statusMap[deriveStatus(selectedKeyData.completion)],
      updated_at: selectedKeyData.updated_at || '',
      project: { id: 'p', name: 'Project' },
      completion: selectedKeyData.completion,
    };
  }, [selectedKeyData]);

  const handleSave = async (keyId: string, lang: string, value: string) => {
    try {
      await apiClient.put('/api/translations/keys', {
        keyId,
        languageCode: lang,
        translation: value,
      });
      setKeys((prev) =>
        prev.map((k) => {
          if (k.id !== keyId) return k;
          const translations = { ...k.translations, [lang]: value };
          return { ...k, translations, completion: completionOf(translations, totalLangs) };
        })
      );
      toast.success('Translation saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save translation');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <div className="w-full space-y-6">
        <PageHeader
          title="Translation Keys"
          subtitle={`Manage translations for ${slug}`}
          actions={
            <Button asChild>
              <Link to={`/projects/${slug}/keys/new`}>
                <Plus className="h-4 w-4" />
                New Key
              </Link>
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search keys…"
              className="w-full h-10 pl-10 pr-4 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={namespaceFilter}
              onChange={setNamespaceFilter}
              options={[
                { value: 'all', label: 'All namespaces' },
                ...namespaces.map((n) => ({ value: n.name, label: n.name })),
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'approved', label: 'Complete' },
                { value: 'review', label: 'In progress' },
                { value: 'draft', label: 'Empty' },
              ]}
            />
          </div>
        </div>

        {/* Workspace: aggregate keys list + detail editor */}
        <div className="flex flex-col lg:flex-row gap-4 min-h-[560px]">
          {/* Keys table */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Keys</span>
              <span className="text-sm text-muted-foreground">· {filteredKeys.length}</span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-16 text-sm text-muted-foreground">
                Loading keys…
              </div>
            ) : error ? (
              <EmptyState
                icon={Search}
                title="Couldn't load keys"
                description={error}
                className="py-16"
              />
            ) : filteredKeys.length === 0 ? (
              <EmptyState
                icon={Search}
                title={keys.length === 0 ? 'No keys yet' : 'No matching keys'}
                description={
                  keys.length === 0
                    ? 'Create your first translation key to get started.'
                    : 'Try adjusting your search or filters.'
                }
                action={
                  keys.length === 0 ? (
                    <Button asChild>
                      <Link to={`/projects/${slug}/keys/new`}>
                        <Plus className="h-4 w-4" />
                        New Key
                      </Link>
                    </Button>
                  ) : undefined
                }
                className="py-16"
              />
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Column header */}
                <div className="flex items-center gap-4 px-4 py-2 border-b border-border sticky top-0 bg-card z-10">
                  <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Key</span>
                  <span className="w-[100px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                  <span className="w-[150px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Languages</span>
                  <span className="w-[90px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</span>
                  <span className="w-8" />
                </div>

                {filteredKeys.map((key) => {
                  const selected = key.id === selectedKey;
                  const done = Object.values(key.translations).filter((t) => (t || '').trim() !== '').length;
                  const pct = key.completion;
                  const status = deriveStatus(pct);
                  const source = key.translations[sourceLanguageCode] || key.description;

                  return (
                    <button
                      key={key.id}
                      onClick={() => setSelectedKey(key.id)}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 border-b border-border text-left transition-colors',
                        selected
                          ? 'bg-brand/5 border-l-2 border-l-brand'
                          : 'border-l-2 border-l-transparent hover:bg-accent/50'
                      )}
                    >
                      {/* Key */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground truncate">{key.key}</span>
                          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {key.namespace}
                          </span>
                        </div>
                        {source && <p className="text-xs text-muted-foreground truncate mt-0.5">{source}</p>}
                      </div>

                      {/* Status */}
                      <div className="w-[100px]">
                        <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium', statusPill[status])}>
                          {statusLabel[status]}
                        </span>
                      </div>

                      {/* Languages (aggregate — scales to any count) */}
                      <div className="w-[150px]">
                        <p className="text-xs text-muted-foreground mb-1">{done} / {totalLangs} languages</p>
                        <ProgressBar value={pct} />
                      </div>

                      {/* Updated */}
                      <div className="w-[90px] text-xs text-muted-foreground">
                        {key.updated_at ? new Date(key.updated_at).toLocaleDateString() : '—'}
                      </div>

                      <div className="w-8 flex justify-center text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail editor (all languages stacked — scrollable) */}
          <div className="w-full lg:w-[440px] lg:shrink-0 bg-card border border-border rounded-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <TranslationDetailPanel
                key={selectedKey || 'empty'}
                translationKey={detailKey}
                languages={languages.map((l) => ({
                  code: l.code,
                  name: l.name,
                  nativeName: l.nativeName || l.name,
                  flag: l.flag || '',
                  direction: l.direction || 'ltr',
                }))}
                sourceLanguageCode={sourceLanguageCode}
                onClose={() => setSelectedKey(null)}
                onSave={handleSave}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
