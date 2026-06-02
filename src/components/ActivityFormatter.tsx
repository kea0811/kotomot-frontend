import {
  CheckCircle,
  Activity,
  AlertCircle,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Package,
  Languages,
  GitBranch,
  Users,
  Key
} from 'lucide-react';

interface ActivityLog {
  action?: string;
  type?: string;
  entity_type?: string;
  user_id?: string;
  user_name?: string;
  actor?: string;
  details?: Record<string, any>;
  created_at?: string;
  timestamp?: string;
  project?: {
    name: string;
  } | string;
}

interface ActivityFormatterProps {
  activity: ActivityLog;
}

export function ActivityFormatter({ activity }: ActivityFormatterProps) {
  // Format the action text
  const getActionText = () => {
    const action = (activity.action || activity.type || '').toLowerCase();
    const entityType = activity.entity_type?.toLowerCase() || '';

    switch (action) {
      case 'created_version':
        return {
          text: 'created a new version',
          icon: <Package className="h-3 w-3 text-green-600 dark:text-green-400" />,
          color: 'bg-green-100 dark:bg-green-900/30'
        };

      case 'reverted_version':
        return {
          text: 'reverted to a previous version',
          icon: <RotateCcw className="h-3 w-3 text-purple-600 dark:text-purple-400" />,
          color: 'bg-purple-100 dark:bg-purple-900/30'
        };

      case 'approved_request':
        return {
          text: 'approved a change request',
          icon: <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />,
          color: 'bg-green-100 dark:bg-green-900/30'
        };

      case 'rejected_request':
        return {
          text: 'rejected a change request',
          icon: <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />,
          color: 'bg-red-100 dark:bg-red-900/30'
        };

      case 'created':
        if (entityType.includes('project')) {
          return {
            text: 'created a new project',
            icon: <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />,
            color: 'bg-green-100 dark:bg-green-900/30'
          };
        } else if (entityType.includes('translation')) {
          return {
            text: 'added a translation',
            icon: <Languages className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
            color: 'bg-blue-100 dark:bg-blue-900/30'
          };
        } else if (entityType.includes('key')) {
          return {
            text: 'added a new key',
            icon: <Key className="h-3 w-3 text-brand" />,
            color: 'bg-indigo-100 dark:bg-indigo-900/30'
          };
        }
        return {
          text: `created ${entityType}`,
          icon: <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />,
          color: 'bg-green-100 dark:bg-green-900/30'
        };

      case 'updated':
        if (entityType.includes('translation')) {
          return {
            text: 'updated a translation',
            icon: <Languages className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
            color: 'bg-blue-100 dark:bg-blue-900/30'
          };
        }
        return {
          text: `updated ${entityType}`,
          icon: <Edit3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
          color: 'bg-blue-100 dark:bg-blue-900/30'
        };

      case 'deleted':
        return {
          text: `deleted ${entityType}`,
          icon: <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />,
          color: 'bg-red-100 dark:bg-red-900/30'
        };

      case 'added_member':
        return {
          text: 'added a team member',
          icon: <Users className="h-3 w-3 text-green-600 dark:text-green-400" />,
          color: 'bg-green-100 dark:bg-green-900/30'
        };

      case 'removed_member':
        return {
          text: 'removed a team member',
          icon: <Users className="h-3 w-3 text-red-600 dark:text-red-400" />,
          color: 'bg-red-100 dark:bg-red-900/30'
        };

      default:
        return {
          text: `${action.replace(/_/g, ' ')} ${entityType}`,
          icon: <Activity className="h-3 w-3 text-muted-foreground" />,
          color: 'bg-muted'
        };
    }
  };

  // Format details into readable text
  const getDetailsText = () => {
    if (!activity.details) return null;

    const details = activity.details;

    // Version details
    if (details.version) {
      return `Version ${details.version}`;
    }
    if (details.new_version) {
      return `Version ${details.new_version}`;
    }
    if (details.reverted_to) {
      return `Reverted to v${details.reverted_to}`;
    }

    // Translation details
    if (details.key) {
      if (details.language) {
        return `${details.key} (${details.language})`;
      }
      return details.key;
    }

    // Approval details
    if (details.approval_type) {
      return details.approval_type.replace(/_/g, ' ');
    }

    // Project details
    if (details.project_name) {
      return details.project_name;
    }

    // Team details
    if (details.team_name) {
      return `Team: ${details.team_name}`;
    }

    // Member details
    if (details.member_name) {
      return details.member_name;
    }

    // Count details
    if (details.count !== undefined) {
      return `${details.count} items`;
    }

    return null;
  };

  // Format relative time
  const formatRelativeTime = (date?: string) => {
    if (!date) return 'recently';

    try {
      const now = new Date();
      const activityDate = new Date(date);

      // Check if date is valid
      if (isNaN(activityDate.getTime())) {
        return 'recently';
      }

      const seconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

      return activityDate.toLocaleDateString();
    } catch (error) {
      return 'recently';
    }
  };

  const actionData = getActionText();
  const detailsText = getDetailsText();
  const userName = activity.user_name || activity.actor || activity.user_id?.substring(0, 8) || 'System';
  const projectName = typeof activity.project === 'string'
    ? activity.project
    : activity.project?.name;

  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 p-1 rounded-full ${actionData.color}`}>
        {actionData.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{userName}</span>
          {' '}
          <span className="text-muted-foreground">
            {actionData.text}
          </span>
          {projectName && (
            <>
              {' '}
              <span className="text-muted-foreground">in</span>
              {' '}
              <span className="text-brand">
                {projectName}
              </span>
            </>
          )}
        </p>

        {detailsText && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {detailsText}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(activity.created_at || activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
