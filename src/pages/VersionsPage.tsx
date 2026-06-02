import { Suspense } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import {
  Clock,
  GitBranch,
  AlertCircle,
  Loader2,
  ChevronRight,
  RotateCcw,
  Settings,
  FileText,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Package
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateVersionModal from './CreateVersionModal';
import ConfirmRevertModal from './ConfirmRevertModal';
import ProjectSelector from './ProjectSelector';
import Select from '@/components/ui/CustomSelect';
import { apiClient } from '@/lib/utils/api-client';

dayjs.extend(relativeTime);

interface ChangelogEntry {
  action: 'add_key' | 'update_translation' | 'delete_key' | 'revert';
  entity_type: 'translation_key' | 'translation' | 'project';
  key?: string;
  namespace?: string;
  language?: string;
  old_value?: string;
  new_value?: string;
  changed_by: {
    user_id: string;
    user_name: string;
  };
  approved_by: {
    user_id: string;
    user_name: string;
  };
  timestamp: string;
}

interface Version {
  id: string;
  version_number: string;
  version_type: 'major' | 'minor' | 'patch';
  is_current: boolean;
  created_by: {
    user_id: string;
    user_name: string;
    team_id: string;
    team_name: string;
  };
  created_at: string;
  changelog_count: number;
  changelog: ChangelogEntry[];
  total_keys: number;
  languages: string[];
  reverted_from?: string;
  reverted_to?: string;
}

interface VersionConfig {
  current_version: string;
  auto_version_on_approval: boolean;
  version_strategy: 'manual' | 'auto-patch' | 'auto-minor';
  slack_notifications_enabled: boolean;
  has_slack_integration?: boolean;
}

interface Project {
  _id: string;
  id?: string;
  name: string;
}

const VERSIONS_PER_PAGE = 10;

export default function VersionsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <VersionsPage />
    </Suspense>
  );
}

function VersionsPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [versions, setVersions] = useState<Version[]>([]);
  const [config, setConfig] = useState<VersionConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [slackIntegration, setSlackIntegration] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revertTarget, setRevertTarget] = useState<{ version: string; current: string } | null>(null);
  const toast = useToast();

  // Refs for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedProject) {
      // Reset state when changing projects
      setVersions([]);
      setPage(1);
      setHasMore(true);
      setExpandedVersion(null);
      fetchVersions(1, true);
    }
  }, [selectedProject]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !versionsLoading) {
        fetchVersions(page + 1);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [page, hasMore, loadingMore, versionsLoading, selectedProject]);

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get('/api/projects');
      setProjects(data.projects || []);

      if (data.projects.length > 0 && !projectId) {
        setSelectedProject(data.projects[0]._id || data.projects[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
      setLoading(false);
    }
  };

  const fetchVersions = async (pageNum: number = 1, reset: boolean = false) => {
    if (!selectedProject) return;

    if (pageNum === 1 || reset) {
      setVersionsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await apiClient.get(`/api/versions?projectId=${selectedProject}&page=${pageNum}&limit=${VERSIONS_PER_PAGE}`);

      if (reset || pageNum === 1) {
        setVersions(data.versions || []);
      } else {
        setVersions(prev => [...prev, ...(data.versions || [])]);
      }

      setConfig(data.config);
      setPage(pageNum);
      setHasMore((data.versions || []).length === VERSIONS_PER_PAGE);

      // Check for Slack integration (only on first page)
      // Silently skip if endpoint not available yet
      if (pageNum === 1 && selectedProject) {
        try {
          const integrationData = await apiClient.get(`/api/integrations?projectId=${selectedProject}&type=slack`);
          setSlackIntegration(integrationData.integrations?.[0] || null);
        } catch {
          // Integration endpoint may not exist yet — ignore
        }
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to fetch version history');
      setHasMore(false);
    } finally {
      setVersionsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRevert = async (targetVersion: string) => {
    setProcessing(targetVersion);
    try {
      const data = await apiClient.post('/api/versions', {
        projectId: selectedProject,
        targetVersion
      });
      toast.success(data.message);

      // Refresh versions from the beginning
      setVersions([]);
      setPage(1);
      setHasMore(true);
      await fetchVersions(1, true);
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to revert version');
    } finally {
      setProcessing(null);
      setRevertTarget(null);
    }
  };

  const handleUpdateConfig = async (updates: Partial<VersionConfig>) => {
    try {
      const response = await apiClient.put('/api/versions', {
        projectId: selectedProject,
        ...updates
      });

      toast.success('Version configuration updated');

      // Just update the config, no need to refresh versions
      setConfig(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add_key':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'delete_key':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'update_translation':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'revert':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVersionTypeBadge = (type: string) => {
    const colors = {
      major: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      patch: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Version Control
        </h1>
        <p className="text-muted-foreground">
          Track changes, view history, and manage versions for your projects
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />

        {config && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand/90 rounded-lg"
            >
              <Package className="w-4 h-4 mr-2" />
              Create New Version
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-accent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        )}
      </div>

      {showSettings && config && (
        <div className="mb-6 p-6 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Version Control Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Auto-version on approval
                </label>
                <p className="text-sm text-muted-foreground">
                  Automatically create new versions when changes are approved
                </p>
              </div>
              <button
                onClick={() => handleUpdateConfig({
                  auto_version_on_approval: !config.auto_version_on_approval
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.auto_version_on_approval ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.auto_version_on_approval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.auto_version_on_approval && (
              <div>
                <Select
                  label="Version strategy"
                  value={config.version_strategy}
                  onChange={(value) => handleUpdateConfig({
                    version_strategy: value as VersionConfig['version_strategy']
                  })}
                  options={[
                    { value: "manual", label: "Manual" },
                    { value: "auto-patch", label: "Auto-increment patch (1.0.X)" },
                    { value: "auto-minor", label: "Auto-increment minor (1.X.0)" }
                  ]}
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Slack notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to Slack when versions change
                  </p>
                </div>
                <button
                  onClick={() => handleUpdateConfig({
                    slack_notifications_enabled: !config.slack_notifications_enabled
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.slack_notifications_enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.slack_notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {config.slack_notifications_enabled && (
                <div className="ml-0 space-y-2">
                  {slackIntegration ? (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                          Slack integration connected
                        </p>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Team: {slackIntegration.teamName} - Channel: #{slackIntegration.channelName || 'general'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Slack integration required for notifications to work
                      </p>
                      <a
                        href={`/integrations?projectId=${selectedProject}`}
                        className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Connect Slack in Integrations
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedProject ? (
        <div className="p-12 text-center bg-card border border-border rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
            Select a project to view its version history
          </p>
        </div>
      ) : versionsLoading && versions.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-lg">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-indigo-500" />
          <p className="text-muted-foreground">
            Loading version history...
          </p>
        </div>
      ) : versions.length === 0 && !versionsLoading ? (
        <div className="p-12 text-center bg-card border border-border rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
            No versions found for this project
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {versions.map((version) => (
            <div
              key={version.id}
              className={`bg-card border rounded-lg ${
                version.is_current
                  ? 'border-blue-500 shadow-lg'
                  : 'border-border'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GitBranch className={`w-5 h-5 ${version.is_current ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          v{version.version_number}
                        </h3>
                        {getVersionTypeBadge(version.version_type)}
                        {version.is_current && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            Current
                          </span>
                        )}
                        {version.reverted_to && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                            Reverted to v{version.reverted_to}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.created_by.user_name} ({version.created_by.team_name})
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {version.created_at && dayjs(version.created_at).isValid()
                            ? dayjs(version.created_at).format('MMM D, YYYY h:mm A')
                            : 'Recently created'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!version.is_current && (
                      <button
                        onClick={() => setRevertTarget({
                          version: version.version_number,
                          current: config?.current_version || '1.0.0'
                        })}
                        disabled={processing === version.version_number}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-md"
                      >
                        {processing === version.version_number ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Revert to this version
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedVersion(
                        expandedVersion === version.id ? null : version.id
                      )}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ChevronRight
                        className={`w-5 h-5 transform transition-transform ${
                          expandedVersion === version.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-muted-foreground">
                      {version.changelog_count} change{version.changelog_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-muted-foreground">
                      {version.total_keys} keys
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-muted-foreground">
                      {version.languages.length} languages
                    </span>
                  </div>
                </div>

                {expandedVersion === version.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3">Version Details</h4>
                    {version.changelog && version.changelog.length > 0 ? (
                      <div className="space-y-2">
                        {version.changelog.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                        >
                          {getActionIcon(entry.action)}
                          <div className="flex-1 text-sm">
                            <div className="font-medium text-foreground">
                              {entry.action === 'revert' ? (
                                `Reverted from v${entry.old_value} to v${entry.new_value}`
                              ) : (
                                <>
                                  {entry.action.replace('_', ' ').charAt(0).toUpperCase() +
                                   entry.action.replace('_', ' ').slice(1)}
                                  {entry.key && (
                                    <code className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">
                                      {entry.namespace ? `${entry.namespace}.${entry.key}` : entry.key}
                                    </code>
                                  )}
                                  {entry.language && (
                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                      ({entry.language})
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            {(entry.old_value || entry.new_value) && entry.action !== 'revert' && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {entry.old_value && (
                                  <div>
                                    <span className="text-red-600 dark:text-red-400">- {entry.old_value}</span>
                                  </div>
                                )}
                                {entry.new_value && (
                                  <div>
                                    <span className="text-green-600 dark:text-green-400">+ {entry.new_value}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="mt-1 text-xs text-muted-foreground">
                              By {entry.changed_by.user_name}
                              {entry.approved_by && entry.approved_by.user_name !== entry.changed_by.user_name && (
                                <> - Approved by {entry.approved_by.user_name}</>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                        No changes recorded in this version
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-8"
            >
              {loadingMore && (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more versions...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && versions.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">You've reached the end of version history</p>
            </div>
          )}
        </>
      )}

      {showCreateModal && selectedProject && (
        <CreateVersionModal
          projectId={selectedProject}
          projectName={projects.find(p => (p._id || p.id) === selectedProject)?.name || 'Unknown Project'}
          currentVersion={config?.current_version || '1.0.0'}
          onClose={() => setShowCreateModal(false)}
          onVersionCreated={() => {
            setShowCreateModal(false);
            // Refresh versions from the beginning
            setVersions([]);
            setPage(1);
            setHasMore(true);
            fetchVersions(1, true);
          }}
        />
      )}

      {revertTarget && (
        <ConfirmRevertModal
          targetVersion={revertTarget.version}
          currentVersion={revertTarget.current}
          onConfirm={() => handleRevert(revertTarget.version)}
          onCancel={() => setRevertTarget(null)}
          isProcessing={processing === revertTarget.version}
        />
      )}
    </div>
  );
}
