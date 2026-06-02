import React, { useState, useEffect } from 'react';
import { X, Plus, Hash, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/CustomSelect';
import { apiClient } from '@/lib/utils/api-client';

interface Project {
  id: string;
  name: string;
  slug?: string;
}

interface AddTranslationKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAdd: (key: string, namespace: string, description: string, projectId: string) => Promise<void>;
  existingNamespaces: string[];
}

export default function AddTranslationKeyModal({
  isOpen,
  onClose,
  projects,
  onAdd,
  existingNamespaces
}: AddTranslationKeyModalProps) {
  const [key, setKey] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState(existingNamespaces[0] || '');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Namespaces for the selected project, fetched live (a project can have
  // namespaces even with zero keys, so we can't derive them from keys).
  const [namespaces, setNamespaces] = useState<string[]>(existingNamespaces);
  const [loadingNs, setLoadingNs] = useState(false);

  useEffect(() => {
    const proj = projects.find((p) => (p.id || (p as any)._id) === projectId);
    const slug = proj?.slug;
    if (!isOpen || !slug) {
      if (isOpen && !slug) setNamespaces(existingNamespaces);
      return;
    }
    let cancelled = false;
    setLoadingNs(true);
    (async () => {
      try {
        const data = await apiClient.get(`/api/projects/${slug}/namespaces`);
        if (cancelled) return;
        const names = (data.namespaces || []).map((n: any) => n.name);
        setNamespaces(names);
        setSelectedNamespace((cur) => (names.includes(cur) ? cur : names[0] || ''));
      } catch {
        if (!cancelled) setNamespaces(existingNamespaces);
      } finally {
        if (!cancelled) setLoadingNs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, projectId, projects, existingNamespaces]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!key.trim()) {
      setError('Translation key is required');
      return;
    }

    if (!key.match(/^[a-zA-Z0-9._-]+$/)) {
      setError('Key can only contain letters, numbers, dots, dashes, and underscores');
      return;
    }

    if (!selectedNamespace) {
      setError('Please select a namespace');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(key.trim(), selectedNamespace, description.trim(), projectId);
      // Reset form
      setKey('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setSelectedNamespace(existingNamespaces[0] || '');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add translation key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Add Translation Key
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Project
            </label>
            {projects.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  No projects available on this account. Create a project (or get added to a team
                  that owns one) first.
                </p>
                <a href="/projects" className="mt-1 inline-block text-sm font-medium text-brand hover:underline">
                  Go to Projects →
                </a>
              </div>
            ) : (
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={projectId}
                  onChange={(value) => setProjectId(value)}
                  options={[
                    { value: '', label: 'Select a project' },
                    ...projects.map((project) => ({
                      value: project.id || (project as any)._id,
                      label: project.name,
                    })),
                  ]}
                  className="pl-10"
                  required
                />
              </div>
            )}
          </div>

          {/* Translation Key */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Translation Key
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g., button.submit, header.title"
                className="w-full pl-10 pr-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                required
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Use dots to create nested keys (e.g., auth.login.button)
            </p>
          </div>

          {/* Namespace */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Namespace
            </label>

            {loadingNs ? (
              <div className="h-10 flex items-center px-3 text-sm text-muted-foreground border border-input rounded-lg">
                Loading namespaces…
              </div>
            ) : namespaces.length > 0 ? (
              <Select
                value={selectedNamespace}
                onChange={(value) => setSelectedNamespace(value)}
                options={namespaces.map(ns => ({
                  value: ns,
                  label: ns
                }))}
                className="w-full"
                required
              />
            ) : (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  No namespaces available for this project yet. Add one from the project's page
                  (Namespaces → Add).
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this translation key is used for..."
                rows={3}
                className="w-full pl-10 pr-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Key
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
