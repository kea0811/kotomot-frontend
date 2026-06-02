import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  CircleDot,
  CircleDashed,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

interface TranslationKey {
  id: string;
  key: string;
  namespace: string;
  description: string;
  translations: Record<string, string>;
  status: 'pending' | 'completed' | 'review';
  updated_at: string;
  project: { id: string; name: string } | null;
  completion: number;
}

interface TranslationDetailPanelProps {
  translationKey: TranslationKey | null;
  languages: Language[];
  sourceLanguageCode?: string;
  onClose: () => void;
  onSave: (keyId: string, languageCode: string, value: string) => Promise<void> | void;
  updating?: boolean;
}

/**
 * Per-language target state, derived from whether a translation exists.
 * The backend stores only the translation string, so we infer a display
 * status here for the editor UI (matches the Pencil design's badges).
 */
function targetState(value: string | undefined) {
  if (value && value.trim() !== '') {
    return {
      label: 'Translated',
      badge: 'bg-success/10 text-success',
      icon: Check,
      iconClass: 'text-success',
      note: 'Has a translation',
    } as const;
  }
  return {
    label: 'Not started',
    badge: 'bg-muted text-muted-foreground',
    icon: CircleDashed,
    iconClass: 'text-muted-foreground',
    note: 'Not started',
  } as const;
}

const keyStatusBadge: Record<TranslationKey['status'], { label: string; cls: string }> = {
  completed: { label: 'Completed', cls: 'bg-success/10 text-success' },
  review: { label: 'In review', cls: 'bg-warning/10 text-warning' },
  pending: { label: 'Pending', cls: 'bg-warning/10 text-warning' },
};

export default function TranslationDetailPanel({
  translationKey,
  languages,
  sourceLanguageCode = 'en',
  onClose,
  onSave,
  updating = false,
}: TranslationDetailPanelProps) {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset transient edit state whenever the selected key changes.
  useEffect(() => {
    setEditingCode(null);
    setDraft('');
    setCopied(false);
  }, [translationKey?.id]);

  if (!translationKey) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CircleDot className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No key selected</p>
        <p className="max-w-[220px] text-xs text-muted-foreground">
          Select a translation key from the list to view and edit its languages.
        </p>
      </div>
    );
  }

  const source = languages.find((l) => l.code === sourceLanguageCode);
  const sourceText = translationKey.translations[sourceLanguageCode] || translationKey.key;
  const targets = languages.filter((l) => l.code !== sourceLanguageCode);
  const status = keyStatusBadge[translationKey.status] ?? keyStatusBadge.pending;

  const copyKey = () => {
    navigator.clipboard?.writeText(translationKey.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const startEdit = (code: string) => {
    setEditingCode(code);
    setDraft(translationKey.translations[code] || '');
  };

  const commitEdit = async (code: string) => {
    await onSave(translationKey.id, code, draft);
    setEditingCode(null);
  };

  return (
    <motion.div
      key={translationKey.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full flex-col"
    >
      {/* Header */}
      <div className="space-y-3 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {translationKey.project?.name || 'Project'} &nbsp;/&nbsp; {translationKey.namespace}
          </p>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close detail panel"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {translationKey.key}
          </h2>
          <button
            onClick={copyKey}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Copy key"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <span className="flex-1" />
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', status.cls)}>
            {status.label}
          </span>
        </div>
        {translationKey.updated_at && (
          <p className="text-xs text-muted-foreground">
            Updated {new Date(translationKey.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Source */}
      <div className="space-y-2 border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Source
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {source ? source.name : 'English (US)'}
          </span>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-sm leading-relaxed text-foreground">{sourceText}</p>
        </div>
        {translationKey.description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Context: {translationKey.description}
          </p>
        )}
      </div>

      {/* Target languages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Target Languages
          </span>
          <span className="text-xs text-muted-foreground">{targets.length} locales</span>
        </div>

        {targets.map((lang) => {
          const value = translationKey.translations[lang.code];
          const state = targetState(value);
          const editing = editingCode === lang.code;
          const StateIcon = state.icon;

          return (
            <div
              key={lang.code}
              className="space-y-2 rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {lang.code} · {lang.name}
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', state.badge)}>
                  {state.label}
                </span>
              </div>

              {editing ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-md border-2 border-brand bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                    placeholder="Add translation…"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingCode(null)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => commitEdit(lang.code)}
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-brand/90 disabled:opacity-60"
                    >
                      {updating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(lang.code)}
                  className="block w-full rounded-md border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-brand/50"
                >
                  {value && value.trim() !== '' ? (
                    value
                  ) : (
                    <span className="text-muted-foreground">Add translation…</span>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2">
                <StateIcon className={cn('h-3.5 w-3.5', state.iconClass)} />
                <span className="text-xs text-muted-foreground">{state.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs text-muted-foreground">AI suggestions available</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
}
