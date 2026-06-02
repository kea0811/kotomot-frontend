import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Settings,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Crown,
  Trash2,
  Edit,
  X,
  FolderOpen,
  Check
} from 'lucide-react';
import { pageVariants, cardVariants } from '@/lib/motion';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import Select from '@/components/ui/CustomSelect';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';

interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_owner: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ProjectTeam {
  project_id: string;
  team_id: string;
  permissions: {
    can_read: boolean;
    can_write: boolean;
    can_delete: boolean;
    requires_approval: boolean;
  };
  assigned_at: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTeams, setProjectTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [permissions] = useState({
    can_read: true,
    can_write: true,
    can_delete: false,
    requires_approval: true, // Always true - all changes require team owner approval
  });
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();
  const supabase = createClient();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchTeams(),
      fetchProjects(),
      fetchProjectTeams()
    ]);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await apiClient.get('/api/teams');
      const result = await handleApiResponse(response);

      if (result.success) {
        setTeams(result.teams);
      } else {
        toast.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Error loading teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/api/projects');
      const result = await handleApiResponse(response);

      if (result.success) {
        // Projects serialize as `_id` from Mongoose; normalize to `id`.
        const normalized: Project[] = (result.projects || []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          slug: p.slug,
        }));
        setProjects(normalized);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchProjectTeams = async () => {
    try {
      const response = await apiClient.get('/api/teams/project-assignments');
      const result = await handleApiResponse(response);

      if (result.success) {
        setProjectTeams(result.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching project assignments:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.post('/api/teams', {
        name: teamName,
        description: teamDescription
      });
      const result = await handleApiResponse(response);

      if (result.success) {
        toast.success('Team created successfully');
        setTeams([...teams, result.team]);
        setShowCreateModal(false);
        setTeamName('');
        setTeamDescription('');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Error creating team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !teamName.trim()) return;

    setIsCreating(true);
    try {
      const response = await apiClient.put('/api/teams', {
        teamId: selectedTeam.id,
        name: teamName,
        description: teamDescription
      });
      const result = await handleApiResponse(response);

      if (result.success) {
        toast.success('Team updated successfully');
        setTeams(teams.map(t =>
          t.id === selectedTeam.id
            ? { ...t, name: teamName, description: teamDescription }
            : t
        ));
        setShowEditModal(false);
        setSelectedTeam(null);
        setTeamName('');
        setTeamDescription('');
      } else {
        toast.error(result.error || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Error updating team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/teams?id=${teamId}`);
      const result = await handleApiResponse(response);

      if (result.success) {
        toast.success('Team deleted successfully');
        setTeams(teams.filter(t => t.id !== teamId));
      } else {
        toast.error(result.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Error deleting team');
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description);
    setShowEditModal(true);
  };

  const handleAssignProject = async () => {
    if (!selectedTeam || !selectedProject) return;

    setIsCreating(true);
    try {
      const response = await apiClient.post('/api/teams/assign-project', {
        team_id: selectedTeam.id,
        project_id: selectedProject,
        permissions
      });
      const result = await handleApiResponse(response);

      if (result.success) {
        toast.success('Project assigned successfully');
        setShowAssignProjectModal(false);
        setSelectedProject('');
        fetchProjectTeams();
      } else {
        toast.error(result.error || 'Failed to assign project');
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      toast.error('Error assigning project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveProjectAssignment = async (teamId: string, projectId: string) => {
    if (!confirm('Remove this project assignment?')) return;

    try {
      const response = await apiClient.delete(`/api/teams/assign-project?team_id=${teamId}&project_id=${projectId}`);
      const result = await handleApiResponse(response);

      if (result.success) {
        toast.success('Assignment removed');
        fetchProjectTeams();
      } else {
        toast.error(result.error || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Error removing assignment');
    }
  };

  const getTeamProjects = (teamId: string) => {
    return projectTeams
      .filter(pt => pt.team_id === teamId)
      .map(pt => {
        const project = projects.find(p => p.id === pt.project_id);
        return { ...pt, project };
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading teams...</div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your teams and collaborate with others
            </p>
          </div>
          {teams.length > 0 && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          )}
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="bg-card border border-border rounded-xl">
            <EmptyState
              icon={Users}
              title="No teams yet"
              description="Create your first team to start collaborating"
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {team.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {team.is_owner && (
                    <div className="relative group">
                      <button className="p-1 hover:bg-accent rounded">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowAssignProjectModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
                        >
                          <FolderOpen className="h-3 w-3" />
                          Assign Project
                        </button>
                        <button
                          onClick={() => openEditModal(team)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Edit Team
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete Team
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {team.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {team.description}
                  </p>
                )}


                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    {team.is_owner ? (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {team.is_owner ? 'Owner' : 'Member'}
                    </span>
                  </div>
                  <Link
                    to={`/teams/${team.id}`}
                    className="text-sm text-brand hover:underline flex items-center gap-1"
                  >
                    Manage
                    <Settings className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Team</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTeamName('');
                  setTeamDescription('');
                }}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setTeamName('');
                    setTeamDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={isCreating || !teamName.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Team</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                  setTeamName('');
                  setTeamDescription('');
                }}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                    setTeamName('');
                    setTeamDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleUpdateTeam}
                  disabled={isCreating || !teamName.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Updating...' : 'Update Team'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Project Modal */}
      {showAssignProjectModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assign Project to {selectedTeam.name}</h2>
              <button
                onClick={() => {
                  setShowAssignProjectModal(false);
                  setSelectedProject('');
                }}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Project</label>
                <Select
                  value={selectedProject}
                  onChange={(value) => setSelectedProject(value)}
                  options={[
                    { value: "", label: "Choose a project..." },
                    ...projects.map((project) => ({
                      value: project.id,
                      label: project.name
                    }))
                  ]}
                  placeholder="Choose a project..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">How it Works</label>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        All team member changes require approval
                      </p>
                      <ul className="text-xs text-foreground space-y-1 ml-2">
                        <li>- Adding new translation keys</li>
                        <li>- Editing existing translations</li>
                        <li>- Deleting translation keys</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        Team owners have full control
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As team owner, you'll review and approve all changes from your team members
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Each team owner only manages approvals for their own team members
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignProjectModal(false);
                    setSelectedProject('');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleAssignProject}
                  disabled={isCreating || !selectedProject}
                  className="flex-1"
                >
                  {isCreating ? 'Assigning...' : 'Assign Project'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
