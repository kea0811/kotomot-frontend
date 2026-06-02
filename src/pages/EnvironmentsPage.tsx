import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  Plus,
  Settings,
  GitBranch,
  Clock,
  ChevronRight,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/utils/api-client';

interface Environment {
  _id: string;
  projectId: string;
  name: string;
  type: 'development' | 'test' | 'staging' | 'production' | 'custom';
  slug: string;
  description?: string;
  version: string;
  previousVersion?: string;
  color?: string;
  order: number;
  isActive: boolean;
  deployedAt?: string;
  deployedBy?: string;
  latestVersion?: {
    _id: string;
    version: string;
    changelog?: string;
    promotedFrom?: string;
    promotedAt?: string;
    createdAt: string;
  };
}

interface Project {
  _id: string;
  name: string;
  slug: string;
}

interface VersionHistory {
  _id: string;
  version: string;
  previousVersion?: string;
  changelog?: string;
  promotedFrom?: string;
  promotedAt?: string;
  promotedBy?: string;
  createdAt: string;
}

export default function EnvironmentsPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [fromEnvironment, setFromEnvironment] = useState<string>('');
  const [toEnvironment, setToEnvironment] = useState<string>('');
  const [promotionChangelog, setPromotionChangelog] = useState('');
  const [newEnvironment, setNewEnvironment] = useState({
    name: '',
    type: 'custom' as const,
    description: '',
    color: '#3b82f6',
  });

  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await apiClient.get('/api/projects');
      return result.projects || result;
    },
  });

  const { data: environments, isLoading: environmentsLoading } = useQuery<Environment[]>({
    queryKey: ['environments', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      return apiClient.get(`/api/environments?projectId=${selectedProject}`);
    },
    enabled: !!selectedProject,
  });

  const { data: versionHistory } = useQuery<VersionHistory[]>({
    queryKey: ['version-history', selectedEnvironment?._id],
    queryFn: async () => {
      if (!selectedEnvironment) return [];
      return apiClient.get(`/api/environments/${selectedEnvironment._id}/versions`);
    },
    enabled: !!selectedEnvironment,
  });

  const createEnvironmentMutation = useMutation({
    mutationFn: async (data: typeof newEnvironment) => {
      return apiClient.post('/api/environments', { ...data, projectId: selectedProject });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', selectedProject] });
      toast({ title: 'Environment created successfully' });
      setCreateDialogOpen(false);
      setNewEnvironment({ name: '', type: 'custom', description: '', color: '#3b82f6' });
    },
    onError: () => {
      toast({ title: 'Failed to create environment', variant: 'destructive' });
    },
  });

  const promoteVersionMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/api/environments/promote', {
        fromEnvironmentId: fromEnvironment,
        toEnvironmentId: toEnvironment,
        changelog: promotionChangelog,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', selectedProject] });
      queryClient.invalidateQueries({ queryKey: ['version-history'] });
      toast({ title: 'Version promoted successfully' });
      setPromoteDialogOpen(false);
      setPromotionChangelog('');
    },
    onError: () => {
      toast({ title: 'Failed to promote version', variant: 'destructive' });
    },
  });

  const updateEnvironmentMutation = useMutation({
    mutationFn: async (data: Partial<Environment>) => {
      return apiClient.put(`/api/environments/${selectedEnvironment?._id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', selectedProject] });
      toast({ title: 'Environment updated successfully' });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to update environment', variant: 'destructive' });
    },
  });

  const deleteEnvironmentMutation = useMutation({
    mutationFn: async (environmentId: string) => {
      return apiClient.delete(`/api/environments/${environmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', selectedProject] });
      toast({ title: 'Environment deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete environment', variant: 'destructive' });
    },
  });

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'development':
        return <GitBranch className="h-4 w-4" />;
      case 'test':
        return <AlertCircle className="h-4 w-4" />;
      case 'staging':
        return <RefreshCw className="h-4 w-4" />;
      case 'production':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Environment Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage environments and promote versions across different stages
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProject && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="brand">
                  <Plus className="h-4 w-4 mr-2" />
                  New Environment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Environment</DialogTitle>
                  <DialogDescription>
                    Add a new environment to your project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newEnvironment.name}
                      onChange={(e) =>
                        setNewEnvironment({ ...newEnvironment, name: e.target.value })
                      }
                      placeholder="e.g., QA Environment"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newEnvironment.type}
                      onValueChange={(value: any) =>
                        setNewEnvironment({ ...newEnvironment, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEnvironment.description}
                      onChange={(e) =>
                        setNewEnvironment({ ...newEnvironment, description: e.target.value })
                      }
                      placeholder="Environment description..."
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={newEnvironment.color}
                        onChange={(e) =>
                          setNewEnvironment({ ...newEnvironment, color: e.target.value })
                        }
                        className="w-20"
                      />
                      <Input
                        value={newEnvironment.color}
                        onChange={(e) =>
                          setNewEnvironment({ ...newEnvironment, color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="brand" onClick={() => createEnvironmentMutation.mutate(newEnvironment)}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environments</CardTitle>
                <CardDescription>
                  View and manage your project environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {environmentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading environments...
                  </div>
                ) : environments?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No environments found. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {environments?.map((env) => (
                      <div
                        key={env._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedEnvironment(env)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: env.color }}
                          />
                          <div className="flex items-center gap-2">
                            {getEnvironmentIcon(env.type)}
                            <span className="font-medium">{env.name}</span>
                          </div>
                          <Badge variant="outline">{env.version}</Badge>
                          <Badge variant="secondary">{env.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {env.deployedAt && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(env.deployedAt).toLocaleDateString()}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {environments && environments.length > 1 && (
                  <div className="mt-6 pt-6 border-t">
                    <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="brand" className="w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Promote Version
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Promote Version</DialogTitle>
                          <DialogDescription>
                            Move a version from one environment to another
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>From Environment</Label>
                              <Select value={fromEnvironment} onValueChange={setFromEnvironment}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                  {environments?.map((env) => (
                                    <SelectItem key={env._id} value={env._id}>
                                      {env.name} ({env.version})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>To Environment</Label>
                              <Select value={toEnvironment} onValueChange={setToEnvironment}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent>
                                  {environments
                                    ?.filter((env) => env._id !== fromEnvironment)
                                    .map((env) => (
                                      <SelectItem key={env._id} value={env._id}>
                                        {env.name} ({env.version})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Changelog</Label>
                            <Textarea
                              value={promotionChangelog}
                              onChange={(e) => setPromotionChangelog(e.target.value)}
                              placeholder="Describe the changes in this promotion..."
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="brand"
                            onClick={() => promoteVersionMutation.mutate()}
                            disabled={!fromEnvironment || !toEnvironment}
                          >
                            Promote
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedEnvironment && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedEnvironment.name}</CardTitle>
                      <CardDescription>{selectedEnvironment.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEnvironmentMutation.mutate(selectedEnvironment._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Version</p>
                        <p className="font-mono">{selectedEnvironment.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge>{selectedEnvironment.type}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Deployed</p>
                        <p className="text-sm">
                          {selectedEnvironment.deployedAt
                            ? new Date(selectedEnvironment.deployedAt).toLocaleString()
                            : 'Never'}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="history">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {versionHistory?.map((version) => (
                            <div key={version._id} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-mono text-sm font-medium">
                                    {version.version}
                                  </p>
                                  {version.changelog && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {version.changelog}
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(version.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Environment</DialogTitle>
            <DialogDescription>Update environment settings</DialogDescription>
          </DialogHeader>
          {selectedEnvironment && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  defaultValue={selectedEnvironment.name}
                  onChange={(e) =>
                    setSelectedEnvironment({ ...selectedEnvironment, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  defaultValue={selectedEnvironment.description}
                  onChange={(e) =>
                    setSelectedEnvironment({
                      ...selectedEnvironment,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    defaultValue={selectedEnvironment.color}
                    onChange={(e) =>
                      setSelectedEnvironment({ ...selectedEnvironment, color: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    defaultValue={selectedEnvironment.color}
                    onChange={(e) =>
                      setSelectedEnvironment({ ...selectedEnvironment, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() =>
                selectedEnvironment &&
                updateEnvironmentMutation.mutate({
                  name: selectedEnvironment.name,
                  description: selectedEnvironment.description,
                  color: selectedEnvironment.color,
                })
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
