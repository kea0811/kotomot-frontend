import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/utils/api-client';
import {
  X,
  Search,
  Globe,
  Check,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Language {
  _id?: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

interface LanguageManagerProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (languages: string[]) => void;
  selectedLanguages?: string[];
}

const LanguageManager = memo(function LanguageManager({
  projectId,
  isOpen,
  onClose,
  onSave,
  selectedLanguages = [],
}: LanguageManagerProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedLanguages));
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filtered languages to avoid unnecessary recalculation
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages;
    }

    const query = searchQuery.toLowerCase().trim();
    return languages.filter((lang) =>
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query) ||
      lang.flag.includes(searchQuery) // Allow searching by emoji flag
    );
  }, [searchQuery, languages]);

  // Memoize fetch function
  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get('/api/languages?catalog=true&limit=200');

      if (result.success && Array.isArray(result.languages)) {
        console.log(`Loaded ${result.languages.length} languages`);
        setLanguages(result.languages);
      } else {
        console.error('Invalid response format:', result);
        setError('Failed to load languages. Invalid response format.');
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError('Failed to load languages. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLanguages();
      // Reset search when modal opens
      setSearchQuery('');
    }
  }, [isOpen, fetchLanguages]);

  // Update selected when prop changes
  useEffect(() => {
    setSelected(new Set(selectedLanguages));
  }, [selectedLanguages]);

  // Memoize toggle function to prevent recreation on each render
  const toggleLanguage = useCallback((code: string) => {
    setSelected(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(code)) {
        newSelected.delete(code);
      } else {
        newSelected.add(code);
      }
      return newSelected;
    });
  }, []);

  // Memoize save handler
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (onSave) {
        onSave(Array.from(selected));
      }

      // Enable selected languages in the database
      await apiClient.patch('/api/languages', {
        projectId,
        languages: Array.from(selected),
        action: 'enable',
      });

      onClose();
    } catch (error) {
      console.error('Error saving languages:', error);
      setError('Failed to save language selection');
    } finally {
      setSaving(false);
    }
  }, [selected, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Manage Languages
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select languages for your project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search languages... (e.g., English, Spanish, zh)"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Languages Grid */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
                <p className="text-sm text-gray-500">Loading languages...</p>
              </div>
            ) : languages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-muted-foreground font-medium">No languages available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please run the seed script to populate languages
                </p>
              </div>
            ) : filteredLanguages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-muted-foreground font-medium">No languages found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching with a different term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => toggleLanguage(language.code)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      selected.has(language.code)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-border hover:border-brand/40'
                    }`}
                  >
                    {selected.has(language.code) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{language.flag}</span>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {language.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language.nativeName}
                        </p>
                        <code className="text-xs text-gray-400 dark:text-gray-500">
                          {language.code}
                        </code>
                      </div>
                    </div>
                    {language.direction === 'rtl' && (
                      <span className="absolute bottom-1 right-1 text-xs bg-muted px-1 rounded">
                        RTL
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-border bg-card">
            <p className="text-sm text-muted-foreground">
              {selected.size} language{selected.size !== 1 ? 's' : ''} selected
              {filteredLanguages.length < languages.length && (
                <span className="ml-2">
                  ({filteredLanguages.length} of {languages.length} shown)
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <Button onClick={handleSave} disabled={saving || selected.size === 0}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Selection
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default LanguageManager;
