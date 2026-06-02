import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import TranslationTable from './TranslationTable';
import {
  Search,
  Filter,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Languages,
  Users,
  FileText,
  Download,
  Upload,
  MoreVertical,
  Loader2,
  Edit,
  Check,
  X,
  Plus,
  Folder,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Hash,
  Info,
  FolderOpen,
} from 'lucide-react';
import { pageVariants, cardVariants, tableRowVariants } from '@/lib/motion';
import LanguageManager from '@/components/LanguageManager';
import AddTranslationKeyModal from '@/components/AddTranslationKeyModal';
import TranslationDetailPanel from '@/components/TranslationDetailPanel';
import Select from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface TranslationKey {
  id: string;
  key: string;
  namespace: string;
  description: string;
  translations: Record<string, string>;
  status: 'pending' | 'completed' | 'review';
  created_at: string;
  updated_at: string;
  project: Project | null;
  projects?: Project[]; // For consolidated keys with multiple projects
  completion: number;
  missingLanguages: string[];
}

interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  translatedTrend: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  totalLanguages: number;
  enabledLanguages: number;
  averageProgress: number;
  recentActivity: Array<{
    id: string;
    key: string;
    language: string;
    translator: string;
    status: string;
    time: string;
  }>;
}

export default function TranslationsPage() {
  const namespaceDropdownRef = React.useRef<HTMLDivElement>(null);
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([]);
  const [enabledLanguages, setEnabledLanguages] = useState<Language[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [showNamespaceDropdown, setShowNamespaceDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'complete' | 'incomplete' | 'missing'>('all');
  const [showLanguageManager, setShowLanguageManager] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [updatingTranslation, setUpdatingTranslation] = useState(false);
  const [gettingAISuggestion, setGettingAISuggestion] = useState(false);
  const [collapsedNamespaces, setCollapsedNamespaces] = useState<Set<string>>(new Set());
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'info' | 'error' | 'success', message: string } | null>(null);
  const [hasAIAccess, setHasAIAccess] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch initial data without a project (gets project list)
    fetchData();
    checkAIAccess();
  }, []);

  // Fetch data when selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchData(selectedProject);
    }
  }, [selectedProject]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Click outside handler for namespace dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (namespaceDropdownRef.current && !namespaceDropdownRef.current.contains(event.target as Node)) {
        setShowNamespaceDropdown(false);
      }
    };

    if (showNamespaceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNamespaceDropdown]);

  const checkAIAccess = async () => {
    try {
      const response = await apiClient.get('/api/settings/check-ai-access');
      const data = await handleApiResponse(response);
      setHasAIAccess(data.hasAccess);
    } catch (error) {
      console.error('Error checking AI access:', error);
      setHasAIAccess(false);
    }
  };

  const fetchData = async (projectId?: string) => {
    setLoading(true);
    try {
      // Build URL with projectId if provided
      const keysUrl = projectId
        ? `/api/translations/keys?projectId=${projectId}`
        : '/api/translations/keys';

      const [keysRes, statsRes] = await Promise.all([
        apiClient.get(keysUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        apiClient.get('/api/translations/stats', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
      ]);

      const keysResult = await handleApiResponse(keysRes);
      const statsResult = await handleApiResponse(statsRes);

      if (keysResult.success) {
        setTranslationKeys(keysResult.keys || []);
        setEnabledLanguages(keysResult.enabledLanguages || []);
        setProjects(keysResult.projects || []);

        // Auto-select first project if none selected
        if (!selectedProject && keysResult.projects?.length > 0) {
          setSelectedProject(keysResult.projects[0].id);
        }
      } else {
        console.error('Failed to fetch translation keys:', keysResult);
      }

      if (statsResult.success) {
        const { success, ...statsData } = statsResult;
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTranslation = async (keyId: string, languageCode: string, translation: string) => {
    setUpdatingTranslation(true);
    try {
      const response = await apiClient.put('/api/translations/keys', {
        keyId,
        languageCode,
        translation
      });

      const result = await handleApiResponse(response);

      if (result.success) {
        // Force refetch data from server to ensure we have the latest
        await fetchData(selectedProject);
        setEditingCell(null);
        setEditValue('');
      } else {
        console.error('Failed to update translation:', result.error);
        alert('Failed to update translation: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating translation:', error);
      alert('Failed to update translation');
    } finally {
      setUpdatingTranslation(false);
    }
  };

  const handleEditClick = (keyId: string, languageCode: string, currentValue: string) => {
    const cellId = `${keyId}-${languageCode}`;
    setEditingCell(cellId);
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = (keyId: string, languageCode: string) => {
    updateTranslation(keyId, languageCode, editValue);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setAiSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddTranslationKey = async (key: string, namespace: string, description: string, projectId: string) => {
    try {
      const response = await apiClient.post('/api/translations/keys', {
        key,
        namespace,
        description,
        projectId,
      });

      await handleApiResponse(response);

      // Refresh the data
      await fetchData(selectedProject);
    } catch (error) {
      console.error('Failed to add translation key:', error);
      throw error;
    }
  };

  const handleGetAISuggestions = async (keyId: string, key: string, targetLanguage: string, sourceText?: string) => {
    setGettingAISuggestion(true);
    setAiSuggestions([]);
    try {
      const response = await apiClient.post('/api/translations/ai-suggest', {
        key,
        targetLanguage,
        sourceText: sourceText || key,
        context: translationKeys.find(k => k.key === key)?.description,
        count: 3,
      });

      let data;
      try {
        data = await handleApiResponse(response);
      } catch (error: unknown) {
        const errorMessage = (error as Error).message || 'Failed to get AI suggestions';
        if (errorMessage.includes('not configured')) {
          setNotification({
            type: 'info',
            message: 'AI provider not configured. Please go to Settings > AI Provider to configure your translation API.'
          });
          return;
        }
        throw error;
      }

      // Always show suggestions, even if they're fallback
      setAiSuggestions(data.suggestions || []);
      setShowSuggestions(true);

      // Check if it's a fallback translation (contains language prefix like [AR], [ES], etc.)
      const isFallback = data.suggestions &&
        data.suggestions.length > 0 &&
        data.suggestions.some((s: string) => /^\[[A-Z]{2}\]/.test(s));

      if (isFallback) {
        // Show a helpful message about team AI configuration
        setNotification({
          type: 'info',
          message: 'Using basic suggestions. Ask your team owner to configure AI provider in Team Settings for better translations.'
        });
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setNotification({
        type: 'error',
        message: `Failed to get AI suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setGettingAISuggestion(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setEditValue(suggestion);
    setAiSuggestions([]);
    setShowSuggestions(false);
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the translation key "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/translations/keys?id=${keyId}`);

      const result = await handleApiResponse(response);

      // Check if approval is required
      if (result.requires_approval) {
        setNotification({
          type: 'info',
          message: result.message || 'Deletion request has been sent to your team owner for approval'
        });
      } else {
        // Remove the key from the local state
        setTranslationKeys(prev => prev.filter(key => key.id !== keyId));

        // Show success notification
        setNotification({
          type: 'success',
          message: `Translation key "${keyName}" has been deleted successfully.`
        });
      }
    } catch (error) {
      console.error('Failed to delete translation key:', error);
      setNotification({
        type: 'error',
        message: `Failed to delete translation key: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const toggleNamespace = (namespace: string) => {
    const newCollapsed = new Set(collapsedNamespaces);
    if (newCollapsed.has(namespace)) {
      newCollapsed.delete(namespace);
    } else {
      newCollapsed.add(namespace);
    }
    setCollapsedNamespaces(newCollapsed);
  };

  const namespaces = useMemo(() => {
    const uniqueNamespaces = [...new Set(translationKeys.map(key => key.namespace))];
    return uniqueNamespaces.sort();
  }, [translationKeys]);

  // Group and consolidate translation keys
  const consolidatedKeys = useMemo(() => {
    const keyMap = new Map<string, TranslationKey>();

    translationKeys.forEach(key => {
      const uniqueKey = `${key.namespace}:${key.key}`;
      if (keyMap.has(uniqueKey)) {
        // Merge with existing key - combine translations and projects
        const existing = keyMap.get(uniqueKey)!;
        const mergedTranslations = { ...existing.translations, ...key.translations };
        const mergedProjects = [existing.project, key.project].filter(Boolean);

        // Recalculate completion based on merged translations
        const translatedCount = enabledLanguages.filter(
          lang => mergedTranslations[lang.code] && mergedTranslations[lang.code].trim() !== ''
        ).length;
        const completion = enabledLanguages.length > 0
          ? Math.round((translatedCount / enabledLanguages.length) * 100)
          : 0;

        const missingLanguages = enabledLanguages.filter(
          lang => !mergedTranslations[lang.code] || mergedTranslations[lang.code].trim() === ''
        ).map(lang => lang.code);

        keyMap.set(uniqueKey, {
          ...existing,
          translations: mergedTranslations,
          completion,
          missingLanguages,
          // Store multiple projects if available
          projects: mergedProjects as Project[],
          project: existing.project || key.project, // Keep one for backward compatibility
        });
      } else {
        keyMap.set(uniqueKey, {
          ...key,
          projects: key.project ? [key.project] : [],
        });
      }
    });

    return Array.from(keyMap.values());
  }, [translationKeys, enabledLanguages]);

  // Group by namespace
  const groupedByNamespace = useMemo(() => {
    const groups = new Map<string, TranslationKey[]>();

    consolidatedKeys.forEach(key => {
      if (!groups.has(key.namespace)) {
        groups.set(key.namespace, []);
      }
      groups.get(key.namespace)!.push(key);
    });

    // Sort keys within each namespace
    groups.forEach((keys) => {
      keys.sort((a, b) => a.key.localeCompare(b.key));
    });

    return groups;
  }, [consolidatedKeys]);

  const filteredKeys = useMemo(() => {
    return consolidatedKeys.filter(key => {
      // Search filter
      const matchesSearch = key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           key.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (key.projects || []).some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Namespace filter
      const matchesNamespace = selectedNamespaces.length === 0 || selectedNamespaces.includes(key.namespace);

      // Project filter - if no project selected, don't show any keys
      if (!selectedProject) {
        return false;
      }
      const matchesProject = key.project?.id === selectedProject ||
                            (key.projects || []).some(p => p.id === selectedProject);

      // Completion filter
      let matchesCompletion = true;
      if (completionFilter === 'complete') {
        matchesCompletion = key.completion === 100;
      } else if (completionFilter === 'incomplete') {
        matchesCompletion = key.completion > 0 && key.completion < 100;
      } else if (completionFilter === 'missing') {
        matchesCompletion = key.completion === 0;
      }

      return matchesSearch && matchesNamespace && matchesProject && matchesCompletion;
    });
  }, [searchQuery, selectedNamespaces, selectedProject, completionFilter, consolidatedKeys]);

  // Group filtered keys by namespace
  const filteredGroupedByNamespace = useMemo(() => {
    const groups = new Map<string, TranslationKey[]>();

    filteredKeys.forEach(key => {
      if (!groups.has(key.namespace)) {
        groups.set(key.namespace, []);
      }
      groups.get(key.namespace)!.push(key);
    });

    // Sort keys within each namespace
    groups.forEach((keys) => {
      keys.sort((a, b) => a.key.localeCompare(b.key));
    });

    // Sort namespaces
    const sortedNamespaces = Array.from(groups.keys()).sort();
    const sortedGroups = new Map<string, TranslationKey[]>();
    sortedNamespaces.forEach(namespace => {
      sortedGroups.set(namespace, groups.get(namespace)!);
    });

    return sortedGroups;
  }, [filteredKeys]);

  // Calculate summary stats
  const totalKeys = translationKeys.length;
  const completeKeys = translationKeys.filter(key => key.completion === 100).length;
  const incompleteKeys = translationKeys.filter(key => key.completion > 0 && key.completion < 100).length;
  const missingKeys = translationKeys.filter(key => key.completion === 0).length;
  const averageCompletion = totalKeys > 0
    ? Math.round(translationKeys.reduce((sum, key) => sum + key.completion, 0) / totalKeys)
    : 0;

  const getCompletionColor = (completion: number) => {
    if (completion === 100) return 'text-emerald-600 dark:text-emerald-400';
    if (completion >= 75) return 'text-blue-600 dark:text-blue-400';
    if (completion >= 50) return 'text-brand';
    if (completion >= 25) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCompletionBg = (completion: number) => {
    if (completion === 100) return 'from-emerald-500 to-teal-500';
    if (completion >= 75) return 'from-blue-500 to-cyan-500';
    if (completion >= 50) return 'from-indigo-500 to-blue-500';
    if (completion >= 25) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 w-full"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 max-w-md ${
              notification.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            ) : notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${
                notification.type === 'error'
                  ? 'text-red-800 dark:text-red-200'
                  : notification.type === 'success'
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {notification.message}
              </p>
              {notification.type === 'info' && notification.message.includes('team owner') && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Team AI settings are managed by team owners
                </p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5`}
            >
              <X className={`w-4 h-4 ${
                notification.type === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : notification.type === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PageHeader
        title="Translation Keys"
        subtitle="Manage translations across all languages and projects"
        actions={
          <>
            <Button onClick={() => setShowAddKeyModal(true)}>
              <Plus className="w-4 h-4" />
              Add Key
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setShowLanguageManager(true)}>
              <Languages className="w-4 h-4" />
              Manage Languages
            </Button>
          </>
        }
      />

      {/* Stats Overview — 4 cards (Pencil workspace design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Keys" value={totalKeys} icon={FileText} />
        <StatCard label="Translated" value={`${averageCompletion}%`} icon={Languages} progress={averageCompletion} />
        <StatCard label="Pending Approvals" value={incompleteKeys} icon={Clock} valueClassName="text-warning" />
        <StatCard label="Active Languages" value={enabledLanguages.length} icon={Globe} />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search keys, descriptions, or projects..."
                className="w-full pl-10 pr-4 py-2 text-sm text-foreground placeholder-gray-500 dark:placeholder-gray-400 bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={namespaceDropdownRef}>
              <button
                onClick={() => setShowNamespaceDropdown(!showNamespaceDropdown)}
                className="px-3 py-2 pr-8 text-sm font-medium text-foreground bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-gray-400" />
                <span>
                  {selectedNamespaces.length === 0
                    ? 'All Namespaces'
                    : selectedNamespaces.length === 1
                    ? selectedNamespaces[0]
                    : `${selectedNamespaces.length} namespaces`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
              </button>

              {showNamespaceDropdown && (
                <div className="absolute top-full mt-1 left-0 w-full min-w-[200px] bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b border-border">
                    <button
                      onClick={() => setSelectedNamespaces([])}
                      className="w-full text-left px-2 py-1 text-sm text-muted-foreground hover:bg-accent rounded transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {namespaces.map(namespace => (
                      <label
                        key={namespace}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNamespaces.includes(namespace)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNamespaces([...selectedNamespaces, namespace]);
                            } else {
                              setSelectedNamespaces(selectedNamespaces.filter(ns => ns !== namespace));
                            }
                          }}
                          className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-foreground">{namespace}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-500 z-10 pointer-events-none" />
              <Select
                value={selectedProject}
                onChange={(value) => setSelectedProject(value)}
                options={[
                  { value: "", label: "Select a project" },
                  ...projects.map(project => ({
                    value: project.id,
                    label: project.name
                  }))
                ]}
                className="pl-10"
              />
            </div>
            <Select
              value={completionFilter}
              onChange={(value) => setCompletionFilter(value as 'all' | 'complete' | 'incomplete' | 'missing')}
              options={[
                { value: "all", label: "All Keys" },
                { value: "complete", label: "Complete (100%)" },
                { value: "incomplete", label: "In Progress" },
                { value: "missing", label: "Missing (0%)" }
              ]}
              className="min-w-[140px]"
            />
          </div>

          {/* Active Filters Summary */}
          {(selectedProject !== 'all' || selectedNamespaces.length > 0 || completionFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <span className="text-muted-foreground">Active filters:</span>
              {selectedProject !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  <FolderOpen className="w-3 h-3" />
                  {projects.find(p => p.id === selectedProject)?.name}
                  <button
                    onClick={() => setSelectedProject('all')}
                    className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedNamespaces.map(namespace => (
                <span key={namespace} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  <Hash className="w-3 h-3" />
                  {namespace}
                  <button
                    onClick={() => setSelectedNamespaces(selectedNamespaces.filter(ns => ns !== namespace))}
                    className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {completionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {completionFilter === 'complete' ? <CheckCircle className="w-3 h-3" /> :
                   completionFilter === 'incomplete' ? <Clock className="w-3 h-3" /> :
                   <AlertCircle className="w-3 h-3" />}
                  {completionFilter === 'complete' ? 'Complete' :
                   completionFilter === 'incomplete' ? 'In Progress' : 'Missing'}
                  <button
                    onClick={() => setCompletionFilter('all')}
                    className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-muted-foreground">
                ({filteredKeys.length} of {consolidatedKeys.length} keys)
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Workspace: keys list (left) + detail editor (right) */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[560px]">
        {/* Keys pane */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">Keys</span>
              <span className="text-sm text-muted-foreground">· {filteredKeys.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredKeys.length === 0 ? (
            translationKeys.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Translation Keys"
                description="Create a project and add translation keys to get started with translations."
                className="py-16"
                action={
                  <Button asChild>
                    <a href="/projects">
                      <Plus className="w-4 h-4" />
                      Create Project
                    </a>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No matching keys"
                description="Try adjusting your search or filter criteria"
                className="py-16"
              />
            )
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Column header */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border sticky top-0 bg-card z-10">
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Key</span>
                <span className="w-[110px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                <span className="w-[96px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Locales</span>
                <span className="w-[120px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progress</span>
              </div>

              {filteredKeys.map((key) => {
                const selected = key.id === selectedKeyId;
                const statusMeta =
                  key.status === 'completed'
                    ? { label: 'Approved', cls: 'bg-success/10 text-success' }
                    : key.status === 'review'
                    ? { label: 'Needs review', cls: 'bg-destructive/10 text-destructive' }
                    : { label: 'Pending', cls: 'bg-warning/10 text-warning' };
                const sourceText = key.translations[enabledLanguages[0]?.code] || key.description || '';

                return (
                  <button
                    key={key.id}
                    onClick={() => setSelectedKeyId(key.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 border-b border-border text-left transition-colors',
                      selected
                        ? 'bg-brand/5 border-l-2 border-l-brand'
                        : 'border-l-2 border-l-transparent hover:bg-accent/50'
                    )}
                  >
                    {/* Key cell */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[13px] truncate', selected ? 'font-semibold text-foreground' : 'text-foreground')}>
                        {key.key}
                      </p>
                      {sourceText && (
                        <p className="text-xs text-muted-foreground truncate">{sourceText}</p>
                      )}
                    </div>

                    {/* Status cell */}
                    <div className="w-[110px]">
                      <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium', statusMeta.cls)}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Locales dots */}
                    <div className="w-[96px] flex items-center gap-1.5">
                      {enabledLanguages.slice(0, 5).map((lang) => {
                        const has = key.translations[lang.code] && key.translations[lang.code].trim() !== '';
                        return (
                          <span
                            key={lang.code}
                            className={cn('h-2 w-2 rounded-full', has ? 'bg-success' : 'bg-muted-foreground/30')}
                            title={lang.name}
                          />
                        );
                      })}
                    </div>

                    {/* Progress cell */}
                    <div className="w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1">{key.completion}%</p>
                      <ProgressBar value={key.completion} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className="w-full lg:w-[460px] lg:shrink-0 bg-card rounded-xl border border-border overflow-hidden">
          <TranslationDetailPanel
            translationKey={filteredKeys.find((k) => k.id === selectedKeyId) || null}
            languages={enabledLanguages}
            sourceLanguageCode={enabledLanguages[0]?.code || 'en'}
            onClose={() => setSelectedKeyId(null)}
            onSave={updateTranslation}
            updating={updatingTranslation}
          />
        </div>
      </div>

      {/* Language Manager Modal */}
      <LanguageManager
        projectId={selectedProject}
        isOpen={showLanguageManager}
        onClose={() => setShowLanguageManager(false)}
        selectedLanguages={enabledLanguages.map(l => l.code)}
        onSave={async (langs) => {
          console.log('Selected languages:', langs);
          await fetchData(selectedProject); // Refresh the data
          setShowLanguageManager(false);
        }}
      />

      {/* Add Translation Key Modal */}
      <AddTranslationKeyModal
        isOpen={showAddKeyModal}
        onClose={() => setShowAddKeyModal(false)}
        projects={projects}
        existingNamespaces={namespaces}
        onAdd={handleAddTranslationKey}
      />
    </motion.div>
  );
}
