import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  X,
  Hash,
  FileText,
  Tag,
  Globe,
  Settings,
  Save,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageVariants, fadeInVariants, cardVariants } from '@/lib/motion';
import Select from '@/components/ui/CustomSelect';
import LanguageManager from '@/components/LanguageManager';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/utils/api-client';
import { useToast } from '@/hooks/useToast';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
}

interface Translation {
  language: string;
  text: string;
}

export default function NewKeyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    keyPath: '',
    namespace: '',
    description: '',
    tags: [] as string[],
    pluralization: false,
    contextNotes: '',
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [namespaces, setNamespaces] = useState<{ name: string }[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showLanguageManager, setShowLanguageManager] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const projData = await apiClient.get(`/api/projects/${slug}`);
        setProjectId(projData.project?._id || null);
        const [langData, nsData] = await Promise.all([
          apiClient.get('/api/languages'),
          apiClient.get(`/api/projects/${slug}/namespaces`),
        ]);
        const langs: Language[] = langData.languages || [];
        setLanguages(langs);
        setNamespaces(nsData.namespaces || []);
        setTranslations(langs.map((l) => ({ language: l.code, text: '' })));
      } catch (err: any) {
        toast.error(err.message || 'Failed to load project data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keyPath.trim()) {
      toast.error('Key path is required');
      return;
    }
    if (!projectId) {
      toast.error('Project not loaded yet');
      return;
    }

    const translationMap: Record<string, string> = {};
    translations.forEach((t) => {
      if (t.text.trim() !== '') translationMap[t.language] = t.text;
    });

    setSubmitting(true);
    try {
      await apiClient.post('/api/translations/keys', {
        key: formData.keyPath.trim(),
        namespace: formData.namespace || 'common',
        description: formData.description,
        projectId,
        translations: translationMap,
      });
      toast.success('Translation key created');
      navigate(`/projects/${slug}/keys`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create key');
    } finally {
      setSubmitting(false);
    }
  };

  const addVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      required: false,
    };
    setVariables([...variables, newVariable]);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, field: keyof Variable, value: any) => {
    setVariables(variables.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const updateTranslation = (language: string, text: string) => {
    setTranslations(translations.map(t =>
      t.language === language ? { ...t, text } : t
    ));
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={`/projects/${slug}/keys`}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Translation Key</h1>
              <p className="mt-2 text-muted-foreground">
                Add a new translation key to {slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          /* Preview Mode */
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            className="bg-card border border-border rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Preview</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Key Information</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p><strong>Key Path:</strong> {formData.keyPath || 'Not specified'}</p>
                  <p><strong>Namespace:</strong> {formData.namespace || 'Not specified'}</p>
                  <p><strong>Description:</strong> {formData.description || 'No description'}</p>
                  <p><strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(', ') : 'No tags'}</p>
                  <p><strong>Pluralization:</strong> {formData.pluralization ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {variables.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Variables</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    {variables.map((variable) => (
                      <div key={variable.id} className="mb-2">
                        <span className="font-mono text-sm">
                          {variable.name} ({variable.type}){variable.required ? ' *' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Translations</h3>
                <div className="space-y-3">
                  {translations
                    .filter(t => t.text.trim() !== '')
                    .map((translation) => {
                      const language = languages.find(l => l.code === translation.language);
                      return (
                        <div key={translation.language} className="bg-muted/50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{language?.flag}</span>
                            <span className="font-medium">{language?.name}</span>
                            <span className="text-sm text-muted-foreground uppercase">
                              ({translation.language})
                            </span>
                          </div>
                          <p className="text-sm">{translation.text}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Key Information */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Key Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="keyPath" className="block text-sm font-medium mb-2">
                    Key Path *
                  </label>
                  <input
                    id="keyPath"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    value={formData.keyPath}
                    onChange={(e) => setFormData({ ...formData, keyPath: e.target.value })}
                    placeholder="e.g., auth.login.title"
                  />
                </div>

                <Select
                  label="Namespace"
                  required
                  placeholder="Select namespace"
                  value={formData.namespace}
                  onChange={(value) => setFormData({ ...formData, namespace: value })}
                  options={namespaces.map((ns) => ({ value: ns.name, label: ns.name }))}
                />

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this translation key is used for..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand/10 text-brand"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-brand/70 hover:text-brand"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 border border-border rounded-md hover:bg-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Variables */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Variables</h2>
                </div>
                <button
                  type="button"
                  onClick={addVariable}
                  className="inline-flex items-center px-3 py-2 border border-border rounded-md hover:bg-accent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </button>
              </div>

              {variables.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No variables defined. Variables allow dynamic content in translations.
                </p>
              ) : (
                <div className="space-y-4">
                  {variables.map((variable) => (
                    <div key={variable.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <input
                        type="text"
                        placeholder="Variable name"
                        className="flex-1 px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                        value={variable.name}
                        onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                      />
                      <div className="w-32">
                        <Select
                          value={variable.type}
                          onChange={(value) => updateVariable(variable.id, 'type', value)}
                          options={[
                            { value: 'string', label: 'String' },
                            { value: 'number', label: 'Number' },
                            { value: 'date', label: 'Date' },
                          ]}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(variable.id, 'required', e.target.checked)}
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariable(variable.id)}
                        className="p-2 text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Translations */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Translations</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLanguageManager(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:opacity-80 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  Manage languages
                </button>
              </div>

              <div className="space-y-4">
                {languages.map((language) => {
                  const translation = translations.find(t => t.language === language.code);
                  return (
                    <div key={language.code} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{language.flag}</span>
                        <div>
                          <span className="font-medium">{language.name}</span>
                          <span className="text-sm text-muted-foreground ml-2 uppercase">
                            ({language.code})
                          </span>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                        value={translation?.text || ''}
                        onChange={(e) => updateTranslation(language.code, e.target.value)}
                        placeholder={`Enter ${language.name} translation...`}
                      />
                    </div>
                  );
                })}

                {/* Add-language CTA */}
                <button
                  type="button"
                  onClick={() => setShowLanguageManager(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
                >
                  <Plus className="h-4 w-4" />
                  Add another language
                </button>
              </div>
            </motion.div>

            {/* Context Notes */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Context Notes</h2>
              </div>

              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                value={formData.contextNotes}
                onChange={(e) => setFormData({ ...formData, contextNotes: e.target.value })}
                placeholder="Add any additional context or instructions for translators..."
              />
            </motion.div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link
                to={`/projects/${slug}/keys`}
                className="px-6 py-2 border border-border rounded-md hover:bg-accent"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4" />
                {submitting ? 'Creating…' : 'Create Key'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Manage languages modal */}
      <LanguageManager
        isOpen={showLanguageManager}
        onClose={() => setShowLanguageManager(false)}
        selectedLanguages={languages.map((l) => l.code)}
        onSave={() => setShowLanguageManager(false)}
      />
    </motion.div>
  );
}
