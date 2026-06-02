import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Crown,
  Shield,
  Trash2,
  Edit,
  X,
  UserPlus,
  FolderOpen,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { pageVariants } from '@/lib/motion';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/CustomSelect';
import { useToast } from '@/hooks/useToast';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Member {
  user_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member';
  added_at: string;
  is_owner: boolean;
}

interface AssignedProject {
  project_id: string;
  name: string;
  slug: string;
  permissions: {
    can_read: boolean;
    can_write: boolean;
    can_delete: boolean;
    requires_approval: boolean;
  };
  assigned_at: string;
}

interface TeamDetail {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_owner: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  members: Member[];
  projects: AssignedProject[];
}

interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const supabase = createClient();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-member row
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [adding, setAdding] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Assign-project modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/teams/${id}`);
      const result = await handleApiResponse(response);
      if (result.success) {
        setTeam(result.team);
        setError(null);
      } else {
        setError(result.error || 'Failed to load team');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      fetchTeam();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = team?.is_owner ?? false;

  const handleAddMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setAdding(true);
    try {
      const result = await handleApiResponse(
        await apiClient.post(`/api/teams/${id}/members`, {
          email: inviteEmail.trim(),
          role: inviteRole,
        })
      );
      if (result.success) {
        toast.success('Member added');
        setTeam((prev) =>
          prev
            ? { ...prev, members: [...prev.members, result.member], member_count: prev.member_count + 1 }
            : prev
        );
        setInviteEmail('');
        setInviteRole('member');
      } else {
        toast.error(result.error || 'Failed to add member');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    // optimistic
    setTeam((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.map((m) =>
              m.user_id === userId ? { ...m, role: role as Member['role'] } : m
            ),
          }
        : prev
    );
    try {
      const result = await handleApiResponse(
        await apiClient.patch(`/api/teams/${id}/members/${userId}`, { role })
      );
      if (!result.success) {
        toast.error(result.error || 'Failed to change role');
        fetchTeam();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change role');
      fetchTeam();
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this team?`)) return;
    try {
      const result = await handleApiResponse(
        await apiClient.delete(`/api/teams/${id}/members/${userId}`)
      );
      if (result.success) {
        toast.success('Member removed');
        setTeam((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((m) => m.user_id !== userId),
                member_count: Math.max(1, prev.member_count - 1),
              }
            : prev
        );
      } else {
        toast.error(result.error || 'Failed to remove member');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const handleUnassignProject = async (projectId: string) => {
    if (!confirm('Remove this project assignment?')) return;
    try {
      const result = await handleApiResponse(
        await apiClient.delete(`/api/teams/assign-project?team_id=${id}&project_id=${projectId}`)
      );
      if (result.success) {
        toast.success('Project unassigned');
        setTeam((prev) =>
          prev ? { ...prev, projects: prev.projects.filter((p) => p.project_id !== projectId) } : prev
        );
      } else {
        toast.error(result.error || 'Failed to unassign project');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to unassign project');
    }
  };

  const openEdit = () => {
    if (!team) return;
    setEditName(team.name);
    setEditDescription(team.description);
    setShowEditModal(true);
  };

  const openAssign = async () => {
    setSelectedProject('');
    setShowAssignModal(true);
    try {
      const result = await handleApiResponse(await apiClient.get('/api/projects'));
      // Projects come back from Mongoose as `_id`; normalize to `id` so the
      // select option values are real strings (not undefined).
      const normalized: ProjectOption[] = (result.projects || []).map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        slug: p.slug,
      }));
      setAllProjects(normalized);
    } catch {
      setAllProjects([]);
    }
  };

  const handleAssignProject = async () => {
    if (!selectedProject) return;
    setAssigning(true);
    try {
      const result = await handleApiResponse(
        await apiClient.post('/api/teams/assign-project', {
          team_id: id,
          project_id: selectedProject,
          permissions: {
            can_read: true,
            can_write: true,
            can_delete: false,
            requires_approval: true,
          },
        })
      );
      if (result.success) {
        toast.success('Project assigned');
        setShowAssignModal(false);
        setSelectedProject('');
        fetchTeam();
      } else {
        toast.error(result.error || 'Failed to assign project');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign project');
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!team || !editName.trim()) return;
    setSaving(true);
    try {
      const result = await handleApiResponse(
        await apiClient.put('/api/teams', {
          teamId: team.id,
          name: editName,
          description: editDescription,
        })
      );
      if (result.success) {
        toast.success('Team updated');
        setTeam((prev) =>
          prev ? { ...prev, name: editName, description: editDescription } : prev
        );
        setShowEditModal(false);
      } else {
        toast.error(result.error || 'Failed to update team');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (!confirm('Delete this team? This cannot be undone.')) return;
    try {
      const result = await handleApiResponse(await apiClient.delete(`/api/teams?id=${team.id}`));
      if (result.success) {
        toast.success('Team deleted');
        navigate('/teams');
      } else {
        toast.error(result.error || 'Failed to delete team');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading team…</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="w-full">
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            icon={Users}
            title="Team not available"
            description={error || 'This team could not be found.'}
          />
        </div>
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
      <div className="w-full space-y-6">
        {/* Back link */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-xl">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                    isOwner ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isOwner ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {isOwner ? 'Owner' : 'Member'}
                </span>
              </div>
              {team.description ? (
                <p className="mt-1 text-muted-foreground">{team.description}</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" onClick={openEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDeleteTeam} className="text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Members */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-5 py-4 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Members</span>
            <span className="text-sm text-muted-foreground">· {team.members.length}</span>
          </div>

          {/* Add member (owner only) */}
          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-border bg-muted/30">
              <div className="relative flex-1">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Add member by email…"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  className="w-full h-10 pl-10 pr-4 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div className="w-full sm:w-36">
                <Select value={inviteRole} onChange={setInviteRole} options={roleOptions} />
              </div>
              <Button onClick={handleAddMember} disabled={adding || !inviteEmail.trim()}>
                {adding ? 'Adding…' : 'Add'}
              </Button>
            </div>
          )}

          <ul className="divide-y divide-border">
            {team.members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-3 px-5 py-3">
                {/* Avatar */}
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt={m.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-semibold">
                    {initials(m.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                    {m.is_owner && <Crown className="h-3.5 w-3.5 text-warning shrink-0" />}
                  </div>
                  {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                </div>

                {/* Role */}
                {m.is_owner ? (
                  <span className="inline-flex rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    Owner
                  </span>
                ) : isOwner ? (
                  <div className="w-32">
                    <Select
                      value={m.role}
                      onChange={(v) => handleRoleChange(m.user_id, v)}
                      options={roleOptions}
                    />
                  </div>
                ) : (
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {m.role}
                  </span>
                )}

                {/* Remove */}
                {isOwner && !m.is_owner && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id, m.name)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Assigned projects */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">Assigned Projects</span>
              <span className="text-sm text-muted-foreground">· {team.projects.length}</span>
            </div>
            {isOwner && (
              <Button size="sm" variant="outline" onClick={openAssign}>
                <Plus className="h-4 w-4" />
                Assign Project
              </Button>
            )}
          </div>

          {team.projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects assigned"
              description={
                isOwner
                  ? 'Assign a project so this team can collaborate on it.'
                  : 'This team has no projects assigned yet.'
              }
              action={
                isOwner ? (
                  <Button onClick={openAssign}>
                    <Plus className="h-4 w-4" />
                    Assign Project
                  </Button>
                ) : undefined
              }
              className="py-12"
            />
          ) : (
            <ul className="divide-y divide-border">
              {team.projects.map((p) => (
                <li key={p.project_id} className="flex items-center gap-3 px-5 py-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/projects/${p.slug}`}
                      className="text-sm font-medium text-foreground hover:text-brand inline-flex items-center gap-1 transition-colors"
                    >
                      {p.name}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {[
                        p.permissions.can_read && 'Read',
                        p.permissions.can_write && 'Write',
                        p.permissions.can_delete && 'Delete',
                        p.permissions.requires_approval && 'Approval required',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleUnassignProject(p.project_id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      aria-label="Unassign project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Team</h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving || !editName.trim()}
                  className="flex-1"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign project modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assign a Project</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <Select
                  value={selectedProject}
                  onChange={setSelectedProject}
                  placeholder="Choose a project…"
                  options={[
                    { value: '', label: 'Choose a project…' },
                    ...allProjects
                      .filter((p) => !team.projects.some((ap) => ap.project_id === p.id))
                      .map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Team members get read &amp; write access. All their changes require your approval.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleAssignProject}
                  disabled={assigning || !selectedProject}
                  className="flex-1"
                >
                  {assigning ? 'Assigning…' : 'Assign Project'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
