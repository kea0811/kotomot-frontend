import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/utils/api-client';
import { X, Loader2, GitBranch, Package } from 'lucide-react';

interface Environment {
  _id: string;
  name: string;
  type: string;
  version: string;
  color?: string;
}

interface CreateVersionModalProps {
  projectId: string;
  projectName: string;
  currentVersion: string;
  onClose: () => void;
  onVersionCreated: () => void;
}

function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3) return '0.0.2';
  switch (type) {
    case 'major': return `${parts[0] + 1}.0.0`;
    case 'minor': return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch': return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}

export default function CreateVersionModal({
  projectId,
  projectName,
  currentVersion,
  onClose,
  onVersionCreated,
}: CreateVersionModalProps) {
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('patch');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEnvs, setLoadingEnvs] = useState(true);
  const [error, setError] = useState('');

  const newVersion = incrementVersion(currentVersion, versionType);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      const data = await apiClient.get(`/api/environments?projectId=${projectId}`);
      setEnvironments(data || []);
    } catch (err) {
      console.error('Error fetching environments:', err);
    } finally {
      setLoadingEnvs(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/api/versions', {
        projectId,
        versionType,
        environmentId: selectedEnvironment || undefined,
      });

      onVersionCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Package className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Create New Version
              </h2>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Current Version */}
        <div className="mb-5 p-3 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current version</span>
          <span className="font-mono font-semibold text-foreground">v{currentVersion}</span>
        </div>

        {/* Version Type */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-2">
            Version Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['patch', 'minor', 'major'] as const).map((type) => {
              const preview = incrementVersion(currentVersion, type);
              const colors = {
                patch: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                minor: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
                major: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
              };
              const selected = versionType === type;
              return (
                <button
                  key={type}
                  onClick={() => setVersionType(type)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selected
                      ? colors[type]
                      : 'border-border hover:border-brand/40'
                  }`}
                >
                  <div className="text-xs font-medium uppercase mb-1">{type}</div>
                  <div className="font-mono text-sm font-semibold">v{preview}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deploy to Environment */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-2">
            Deploy to Environment
          </label>
          {loadingEnvs ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading environments...
            </div>
          ) : environments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No environments found. Create one in the Environments page first.
            </p>
          ) : (
            <div className="space-y-2">
              {environments.map((env) => (
                <button
                  key={env._id}
                  onClick={() => setSelectedEnvironment(selectedEnvironment === env._id ? '' : env._id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    selectedEnvironment === env._id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-border hover:border-brand/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color || '#3b82f6' }} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">{env.name}</div>
                      <div className="text-xs text-muted-foreground">{env.type} — v{env.version}</div>
                    </div>
                  </div>
                  <GitBranch className={`w-4 h-4 ${selectedEnvironment === env._id ? 'text-indigo-500' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Version Preview */}
        <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-brand">New version</span>
          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">v{newVersion}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-brand hover:bg-brand/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Create v{newVersion}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
