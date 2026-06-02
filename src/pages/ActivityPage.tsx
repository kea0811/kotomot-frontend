import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Loader2,
  Filter,
} from 'lucide-react';
import { pageVariants, fadeInVariants } from '@/lib/motion';
import { ActivityFormatter } from '@/components/ActivityFormatter';
import { createClient } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import Select from '@/components/ui/CustomSelect';

export default function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activities, setActivities] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false
  });
  const supabase = createClient();
  const navigate = useNavigate();

  // Fetch activities from API
  useEffect(() => {
    fetchActivities();
  }, [dateFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams();
      if (dateFilter !== 'all') params.append('dateRange', dateFilter);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      const response = await fetch(`/api/activities?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setActivities(result.activities || []);
        setPagination(result.pagination || {
          limit: 50,
          offset: 0,
          total: 0,
          hasMore: false
        });
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter !== 'all') params.append('dateRange', dateFilter);
      params.append('limit', pagination.limit.toString());
      params.append('offset', (pagination.offset + pagination.limit).toString());

      const response = await fetch(`/api/activities?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setActivities([...activities, ...(result.activities || [])]);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to load more activities:', error);
    }
  };

  // Filter activities by search query
  const filteredActivities = activities.filter((activity: any) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const userName = activity.user_name || activity.actor || '';
    const projectName = activity.project?.name || activity.project || '';
    const action = activity.action || activity.type || '';
    const entityType = activity.entity_type || '';

    return (
      userName.toLowerCase().includes(searchLower) ||
      projectName.toLowerCase().includes(searchLower) ||
      action.toLowerCase().includes(searchLower) ||
      entityType.toLowerCase().includes(searchLower) ||
      (activity.details?.key && activity.details.key.toLowerCase().includes(searchLower))
    );
  });

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
            <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
            <p className="mt-2 text-muted-foreground">
              Track all changes and activities across your projects
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pagination.total} total activities</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={dateFilter}
              onChange={(value) => setDateFilter(value)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" }
              ]}
              className="min-w-[120px]"
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <motion.div
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              className="text-center py-12"
            >
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query to see more activities.'
                  : 'Activities will appear here as you make changes to your projects.'}
              </p>
            </motion.div>
          ) : (
            <div className="divide-y divide-border">
              {filteredActivities.map((activity: any, index: number) => (
                <div key={activity.id || index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <ActivityFormatter activity={activity} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {!loading && pagination.hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-card border border-border rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 text-foreground"
            >
              Load More Activities
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
