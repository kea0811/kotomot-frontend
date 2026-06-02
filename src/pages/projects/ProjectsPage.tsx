import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen } from 'lucide-react';
import { cardGridVariants, cardVariants, pageVariants } from '@/lib/motion';
import { createClient } from '@/lib/supabase/client';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  stats?: {
    locales: number;
    keys: number;
    members: number;
    completion: number;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const supabase = createClient();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/api/projects');
      const result = await handleApiResponse(response);

      setProjects(result.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

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
        <div className="mb-6">
          <PageHeader
            title="Projects"
            subtitle="Manage your translation projects"
            actions={
              projects.length > 0 ? (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              ) : undefined
            }
          />
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl">
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Create your first project to get started with translations"
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              }
            />
          </div>
        ) : (
          <motion.div
            variants={cardGridVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects.map((project) => (
              <motion.div
                key={(project as any)._id || project.id || project.slug}
                variants={cardVariants}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
                >
                  {/* Card top: name + locales badge */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-foreground line-clamp-1">
                      {project.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {project.stats?.locales ?? 0} locales
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {project.description || 'No description'}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {project.stats?.completion || 0}% translated
                  </p>
                  <ProgressBar value={project.stats?.completion || 0} />

                  <p className="text-xs text-muted-foreground">
                    {project.stats?.keys ?? 0} keys
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create Project Modal */}
        <AnimatePresence mode="wait">
          {showCreateModal && (
            <CreateProjectModal
              key="create-modal"
              onClose={() => setShowCreateModal(false)}
              onProjectCreated={handleProjectCreated}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CreateProjectModal({
  onClose,
  onProjectCreated
}: {
  onClose: () => void;
  onProjectCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create a project');
        return;
      }

      const response = await apiClient.post('/api/projects', {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
      });
      const result = await handleApiResponse(response);

      onProjectCreated();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-xl p-6 max-w-md w-full shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">Create New Project</h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg shadow-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition-colors disabled:opacity-50"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                setFormData({ ...formData, name, slug });
              }}
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1 text-foreground">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              required
              disabled={loading}
              pattern="[a-z0-9-]+"
              className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg shadow-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition-colors disabled:opacity-50"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              placeholder="my-awesome-project"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-foreground">
              Description (Optional)
            </label>
            <textarea
              id="description"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg shadow-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition-colors disabled:opacity-50"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your project..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
