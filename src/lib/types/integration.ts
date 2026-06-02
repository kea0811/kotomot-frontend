// Integration types for Koto
export interface SlackIntegration {
  id: string;
  projectId: string;
  type: 'slack';
  workspaceId?: string;
  workspaceName?: string;
  userId?: string;
  teamId?: string;
  teamName?: string;
  accessToken?: string;
  botUserId?: string;
  appId?: string;
  scope?: string;
  channelId?: string;
  channelName?: string;
  webhook?: {
    url: string;
    channel: string;
    configurationUrl: string;
  };
  channels?: Array<string | SlackChannel>;
  recipients?: Array<string | SlackRecipient>;
  isActive: boolean;
  notificationSettings?: SlackNotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlackNotificationSettings {
  enabled: boolean;
  events: {
    translationAdded: boolean;
    translationUpdated: boolean;
    translationApproved: boolean;
    translationRejected: boolean;
    keyAdded: boolean;
    keyDeleted: boolean;
    commentAdded: boolean;
    memberJoined: boolean;
    importCompleted: boolean;
    exportCompleted: boolean;
    versionCreated: boolean;
    versionReverted: boolean;
  };
  channels: SlackChannel[];
  recipients: SlackRecipient[];
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isMember: boolean;
}

export interface SlackRecipient {
  id: string;
  name: string;
  realName: string;
  email?: string;
}

export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: {
    name: string;
    id: string;
  };
  enterprise?: {
    name: string;
    id: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  is_enterprise_install: boolean;
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}

export interface SlackBlock {
  type: 'section' | 'header' | 'context' | 'divider' | 'actions' | string;
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SlackAttachment {
  color?: string;
  fallback?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
}

export interface SlackApiChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}

export interface SlackApiMember {
  id: string;
  name: string;
  real_name: string;
  is_bot: boolean;
  deleted: boolean;
  profile?: {
    email?: string;
  };
}

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  channels?: SlackApiChannel[];
  members?: SlackApiMember[];
}

export interface SlackMessage {
  channel: string;
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  thread_ts?: string;
  mrkdwn?: boolean;
}

export type IntegrationType = 'slack' | 'discord' | 'teams' | 'webhook';

export interface Integration {
  id: string;
  type: IntegrationType;
  projectId: string;
  userId: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}