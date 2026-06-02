import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageVariants, listItemVariants } from '@/lib/motion';
import { authenticatedFetch } from '@/lib/utils/api-client';

interface ApiKeyItem {
  id: string;
  name: string;
  permissions: string[];
  projectId?: string;
  isActive: boolean;
  lastUsedAt?: string;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
}

const PERMISSION_OPTIONS = [
  { value: 'read:translations', label: 'Read Translations' },
  { value: 'write:translations', label: 'Write Translations' },
  { value: 'read:projects', label: 'Read Projects' },
  { value: 'write:projects', label: 'Write Projects' },
  { value: 'read:keys', label: 'Read Keys' },
  { value: 'write:keys', label: 'Write Keys' },
  { value: 'admin:all', label: 'Admin (All Permissions)' },
];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/user/api-keys');
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRevoke = async (keyId: string) => {
    try {
      const res = await authenticatedFetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch (error) {
      console.error('Error revoking key:', error);
    }
  };

  const handleKeyCreated = (key: string) => {
    setNewKeyValue(key);
    setShowCreateModal(false);
    fetchKeys();
  };

  const copyKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage API keys for programmatic access to your projects
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create API Key
          </Button>
        </div>

        {/* New Key Banner */}
        {newKeyValue && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400 mb-1">
                  API key created successfully
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Copy this key now. You won't be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono break-all">
                    {newKeyValue}
                  </code>
                  <button
                    onClick={copyKey}
                    className="px-3 py-2 bg-card border border-border rounded hover:bg-accent"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button onClick={() => setNewKeyValue(null)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Keys List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="h-5 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Key className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-1">No API keys yet</p>
            <p className="text-xs text-muted-foreground">
              Create an API key to access the platform programmatically
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                variants={listItemVariants}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{key.name}</h3>
                      {key.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-500">
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {key.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDate(key.createdAt)}
                      </span>
                      <span>Last used: {formatDate(key.lastUsedAt)}</span>
                      <span>{key.usageCount} requests</span>
                      {key.expiresAt && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expires {formatDate(key.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {key.isActive && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                      title="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Usage Info */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Using your API key
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Include your API key in requests using one of these methods:
          </p>
          <div className="space-y-2">
            <code className="block px-3 py-2 bg-background border border-border rounded text-xs font-mono">
              curl -H &quot;X-API-Key: hms_live_...&quot; {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3008'}/api/projects
            </code>
            <code className="block px-3 py-2 bg-background border border-border rounded text-xs font-mono">
              curl -H &quot;Authorization: Bearer hms_live_...&quot; {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3008'}/api/projects
            </code>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateApiKeyModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleKeyCreated}
          />
        )}
      </div>
    </motion.div>
  );
}

function CreateApiKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: string) => void;
}) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePermission = (perm: string) => {
    if (perm === 'admin:all') {
      setPermissions((prev) =>
        prev.includes('admin:all') ? [] : ['admin:all']
      );
      return;
    }
    setPermissions((prev) => {
      const filtered = prev.filter((p) => p !== 'admin:all');
      return filtered.includes(perm)
        ? filtered.filter((p) => p !== perm)
        : [...filtered, perm];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await authenticatedFetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create API key');
      }

      onCreated(data.apiKey.key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create API Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label htmlFor="keyName" className="block text-sm font-medium mb-1">
              Key Name
            </label>
            <input
              id="keyName"
              type="text"
              required
              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CI/CD Pipeline, Mobile App"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Permissions</label>
            <div className="space-y-2">
              {PERMISSION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(opt.value) || permissions.includes('admin:all')}
                    onChange={() => togglePermission(opt.value)}
                    disabled={opt.value !== 'admin:all' && permissions.includes('admin:all')}
                    className="rounded border-input"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md hover:bg-accent"
              disabled={submitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting || permissions.length === 0}>
              {submitting ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
