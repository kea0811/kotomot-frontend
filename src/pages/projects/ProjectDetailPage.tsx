import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Key,
  Users,
  FolderOpen,
  Settings,
  FileText,
  Download,
  Upload,
  Plus,
  BarChart,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { pageVariants, listItemVariants } from '@/lib/motion';
import { authenticatedFetch } from '@/lib/utils/api-client';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNamespaceModal, setShowNamespaceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectRes, namespacesRes] = await Promise.all([
        authenticatedFetch(`/api/projects/${slug}`),
        authenticatedFetch(`/api/projects/${slug}/namespaces`),
      ]);

      if (!projectRes.ok) {
        throw new Error(projectRes.status === 404 ? 'Project not found' : 'Failed to load project');
      }

      const projectData = await projectRes.json();
      const namespacesData = await namespacesRes.json();

      setProject(projectData.project);
      setNamespaces(namespacesData.namespaces || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="w-full">
          <div className="mb-8">
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">{error || 'Project not found'}</p>
          <Link to="/projects" className="text-primary hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const stats = project.computedStats || {};

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-muted-foreground">{project.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/projects/${slug}/keys`}>
                  <Key className="h-4 w-4" />
                  Manage Keys
                </Link>
              </Button>
              {project.is_owner && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 border border-input rounded-md hover:bg-accent transition-colors"
                  aria-label="Project settings"
                  title="Project settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Keys" value={stats.totalKeys || 0} icon={Key} />
          <StatCard
            label="Completion"
            value={`${stats.completionRate || 0}%`}
            icon={BarChart}
            progress={stats.completionRate || 0}
          />
          <StatCard label="Namespaces" value={stats.totalNamespaces || 0} icon={FolderOpen} />
          <StatCard label="Team Members" value={stats.memberCount || 0} icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Namespaces */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Namespaces</h2>
              <button
                onClick={() => setShowNamespaceModal(true)}
                className="inline-flex items-center px-3 py-1 text-sm border border-input rounded-md hover:bg-accent"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </button>
            </div>
            {namespaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No namespaces yet</p>
                <p className="text-xs mt-1">Create your first namespace to organize translation keys</p>
              </div>
            ) : (
              <div className="space-y-3">
                {namespaces.map((namespace) => (
                  <motion.div
                    key={namespace.id}
                    variants={listItemVariants}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{namespace.name}</h3>
                        {namespace.description && (
                          <p className="text-sm text-muted-foreground">{namespace.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{namespace.keys} keys</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to={`/projects/${slug}/import`}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Import Translations</span>
                </Link>
                <Link
                  to={`/projects/${slug}/export`}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Export Translations</span>
                </Link>
                <Link
                  to="/activity"
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">View Full Activity Log</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="text-sm text-muted-foreground text-center py-6">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity yet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Namespace Modal */}
        {showNamespaceModal && (
          <CreateNamespaceModal
            slug={slug!}
            onClose={() => setShowNamespaceModal(false)}
            onCreated={() => fetchData()}
          />
        )}

        {/* Project Settings Modal */}
        {showSettingsModal && (
          <ProjectSettingsModal
            slug={slug!}
            project={project}
            onClose={() => setShowSettingsModal(false)}
            onSaved={() => {
              setShowSettingsModal(false);
              fetchData();
            }}
            onDeleted={() => navigate('/projects')}
          />
        )}
      </div>
    </motion.div>
  );
}

function CreateNamespaceModal({ slug, onClose, onCreated }: { slug: string; onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await authenticatedFetch(`/api/projects/${slug}/namespaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create namespace');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create Namespace</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Namespace Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., common, products, checkout"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this namespace..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Namespace'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ProjectSettingsModal({
  slug,
  project,
  onClose,
  onSaved,
  onDeleted,
}: {
  slug: string;
  project: any;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save changes');
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/projects/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }
      onDeleted();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
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
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>

          {/* Danger zone */}
          <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-foreground">Danger zone</h3>
            {!confirmDelete ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permanently delete this project and all its keys, namespaces, versions and team
                  assignments. This cannot be undone.
                </p>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  Are you sure? This will delete <span className="font-semibold text-foreground">{project.name}</span> and everything in it.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Deleting…' : 'Yes, delete it'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
