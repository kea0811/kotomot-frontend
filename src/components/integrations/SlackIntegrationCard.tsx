import { useState } from 'react';
import { Switch } from '@/components/ui/Switch';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import {
  MessageSquare,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  Hash,
  User,
  Bell,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlackIntegration {
  id: string;
  teamName: string;
  channelName?: string;
  isActive: boolean;
  notificationSettings: {
    enabled: boolean;
    events: Record<string, boolean>;
    channels: Array<{ id: string; name: string }>;
    recipients: Array<{ id: string; name: string }>;
  };
}

interface SlackIntegrationCardProps {
  integration?: SlackIntegration;
  projectId: string;
  onConnect: () => void;
  onDisconnect: (integrationId: string) => void;
  onSettingsUpdate: (integrationId: string, settings: Record<string, unknown>) => void;
}

export function SlackIntegrationCard({
  integration,
  projectId,
  onConnect,
  onDisconnect,
  onSettingsUpdate
}: SlackIntegrationCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConnect = () => {
    window.location.href = `/api/integrations/slack/connect?projectId=${projectId}`;
  };

  const handleToggleActive = async () => {
    if (!integration) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.put('/api/integrations/slack', {
        integrationId: integration.id,
        isActive: !integration.isActive
      });

      await handleApiResponse(response);
      onSettingsUpdate(integration.id, { isActive: !integration.isActive });
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!integration) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.put('/api/integrations/slack', {
        integrationId: integration.id,
        notificationSettings: {
          ...integration.notificationSettings,
          enabled: !integration.notificationSettings.enabled
        }
      });

      await handleApiResponse(response);
      onSettingsUpdate(integration.id, {
        notificationSettings: {
          ...integration.notificationSettings,
          enabled: !integration.notificationSettings.enabled
        }
      });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration || !confirm('Are you sure you want to disconnect Slack? This will remove all notification settings for this project.')) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.delete(`/api/integrations/slack?integrationId=${integration.id}&projectId=${projectId}`);

      await handleApiResponse(response);
      onDisconnect(integration.id);
      // Optionally show a success message
      console.log('Slack integration disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect Slack integration');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!integration) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Slack</h3>
                <p className="text-sm text-muted-foreground">Connect Slack to receive notifications</p>
              </div>
            </div>
            <Button onClick={handleConnect}>
              Connect Slack
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Slack
                {integration.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                    <XCircle className="h-3 w-3" />
                    Disabled
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {integration.teamName}
                {integration.channelName && ` - #${integration.channelName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={integration.isActive}
              onChange={handleToggleActive}
              disabled={isUpdating}
            />
            <button
              className="p-1.5 rounded-md hover:bg-accent"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-accent"
              onClick={handleDisconnect}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="px-4 pb-4 space-y-4">
          {/* Notification Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                {integration.notificationSettings.enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                Notifications
              </label>
              <Switch
                checked={integration.notificationSettings.enabled}
                onChange={handleToggleNotifications}
                disabled={isUpdating}
              />
            </div>

            {integration.notificationSettings.enabled && (
              <>
                {/* Channels */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {integration.notificationSettings.channels.map(channel => (
                      <span key={channel.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground border border-border">
                        <Hash className="h-3 w-3" />
                        {channel.name}
                      </span>
                    ))}
                    {integration.notificationSettings.channels.length === 0 && (
                      <span className="text-sm text-muted-foreground">No channels configured</span>
                    )}
                  </div>
                </div>

                {/* Recipients */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Direct Messages</label>
                  <div className="flex flex-wrap gap-2">
                    {integration.notificationSettings.recipients.map(recipient => (
                      <span key={recipient.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground border border-border">
                        <User className="h-3 w-3" />
                        {recipient.name}
                      </span>
                    ))}
                    {integration.notificationSettings.recipients.length === 0 && (
                      <span className="text-sm text-muted-foreground">No direct messages configured</span>
                    )}
                  </div>
                </div>

                {/* Event Types */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Notification Events</label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(integration.notificationSettings.events).map(([event, enabled]) => (
                      <div key={event} className="flex items-center gap-2">
                        {enabled ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={enabled ? '' : 'text-muted-foreground'}>
                          {event.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent"
                  onClick={() => window.location.href = `/projects/${projectId}/integrations/slack/${integration.id}`}
                >
                  Configure Notifications
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
