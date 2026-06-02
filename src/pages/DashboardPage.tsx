import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  FolderOpen,
  Languages,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActivityFormatter } from '@/components/ActivityFormatter';
import { Link, useNavigate } from 'react-router-dom';
import { pageVariants, cardVariants } from '@/lib/motion';
import { createClient } from '@/lib/supabase/client';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface DashboardStats {
  totalProjects: number;
  activeTranslations: number;
  pendingReviews: number;
  teamMembers: number;
}

interface RecentProject {
  id: string;
  name: string;
  slug: string;
  progress: number;
  keys: number;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeTranslations: 0,
    pendingReviews: 0,
    teamMembers: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch dashboard data from API
      const response = await apiClient.get('/api/dashboard');
      const result = await handleApiResponse(response);

      setStats(result.stats);

      setRecentProjects(
        (result.recentProjects || []).map((project: any) => {
          let lastUpdated = 'Recently';
          if (project.updated_at) {
            try {
              const date = new Date(project.updated_at);
              if (!isNaN(date.getTime())) {
                lastUpdated = date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            } catch (error) {
              console.error('Error parsing date:', project.updated_at);
            }
          }

          return {
            id: project.id,
            name: project.name,
            slug: project.slug,
            progress: 0, // Would calculate from translations
            keys: 0, // Would count from translations
            lastUpdated,
          };
        })
      );

      setRecentActivity(result.recentActivities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects.toString(),
      change: '+0',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      icon: FolderOpen,
    },
    {
      label: 'Active Translations',
      value: stats.activeTranslations.toString(),
      change: '+0',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      icon: Languages,
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews.toString(),
      change: '0',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      icon: Clock,
    },
    {
      label: 'Team Members',
      value: stats.teamMembers.toString(),
      change: '0',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
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
        <div className="mb-8">
          <PageHeader
            title="Dashboard"
            subtitle="Welcome back! Here's an overview of your translation projects."
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={index}
              whileHover={{ y: -2 }}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={
                  stat.trend !== 'neutral'
                    ? { direction: stat.trend, text: `${stat.change} from last month` }
                    : undefined
                }
              />
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
                <Link
                  to="/projects"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No projects yet"
                  className="py-8"
                  action={
                    <Link
                      to="/projects"
                      className="text-sm font-medium text-brand hover:opacity-80"
                    >
                      Create your first project
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.slug}`}
                      className="block p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {project.lastUpdated}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {project.keys} keys
                        </span>
                        <span className="text-sm font-medium">
                          {project.progress}%
                        </span>
                      </div>

                      <ProgressBar value={project.progress} height={8} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Link
                  to="/activity"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <ActivityFormatter key={index} activity={activity} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-brand rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Quick Actions</h3>
              </div>

              <div className="space-y-2">
                <Link
                  to="/projects"
                  className="block w-full rounded-lg bg-white/15 px-4 py-2 text-left text-sm transition-colors hover:bg-white/25"
                >
                  Create New Project
                </Link>
                <Link
                  to="/translations"
                  className="block w-full rounded-lg bg-white/15 px-4 py-2 text-left text-sm transition-colors hover:bg-white/25"
                >
                  Add Translations
                </Link>
                <Link
                  to="/review"
                  className="block w-full rounded-lg bg-white/15 px-4 py-2 text-left text-sm transition-colors hover:bg-white/25"
                >
                  Review Pending Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
