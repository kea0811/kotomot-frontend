import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Globe,
  Bell,
  Shield,
  Key,
  Palette,
  Monitor,
  Moon,
  Sun,
  Save,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { pageVariants, cardVariants, fadeInVariants } from '@/lib/motion';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';

// Local-only defaults. Identity (name/email/avatar) is loaded from the
// authenticated Supabase user; notification/preference toggles are client-side
// only (no backend persistence yet).
const defaultUser = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  timezone: 'America/New_York',
  language: 'en',
  theme: 'system',
  notifications: {
    email: {
      translationUpdates: true,
      reviewRequests: true,
      projectInvites: true,
      weeklyDigest: false,
    },
    browser: {
      translationUpdates: false,
      reviewRequests: true,
      projectInvites: true,
    },
  },
  preferences: {
    defaultLanguage: 'en',
    showKeyPaths: true,
    compactView: false,
    autoSave: true,
  },
};

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export default function ProfileSettingsPage() {
  const supabase = createClient();
  const toast = useToast();
  const [user, setUser] = useState(defaultUser);
  const [originalEmail, setOriginalEmail] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;
      const name =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        '';
      setUser((prev) => ({
        ...prev,
        id: authUser.id,
        name,
        email: authUser.email || '',
        avatar: authUser.user_metadata?.avatar_url || '',
      }));
      setOriginalEmail(authUser.email || '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const payload: { email?: string; data: Record<string, unknown> } = {
        data: { full_name: user.name, avatar_url: user.avatar || null },
      };
      if (user.email && user.email !== originalEmail) {
        payload.email = user.email;
      }
      const { error } = await supabase.auth.updateUser(payload);
      if (error) throw error;
      if (payload.email) {
        toast.success('Profile saved. Check your inbox to confirm the new email.');
        setOriginalEmail(user.email);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err.message || 'Failed to save profile');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      toast.success('Password updated');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const updateUser = (updates: Partial<typeof user>) => {
    setUser({ ...user, ...updates });
  };

  const updateNotifications = (category: 'email' | 'browser', key: string, value: boolean) => {
    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        [category]: {
          ...user.notifications[category],
          [key]: value,
        },
      },
    });
  };

  const updatePreferences = (key: string, value: any) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        [key]: value,
      },
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
  ];

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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-brand-foreground border-t-transparent rounded-full" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${activeTab === tab.id ? 'text-brand' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Profile Information */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="h-20 w-20 rounded-full" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button className="inline-flex items-center px-3 py-2 border border-border rounded-md hover:bg-accent">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </button>
                        {user.avatar && (
                          <button className="inline-flex items-center px-3 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                          value={user.name}
                          onChange={(e) => updateUser({ name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                          value={user.email}
                          onChange={(e) => updateUser({ email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                          Timezone
                        </label>
                        <select
                          id="timezone"
                          className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                          value={user.timezone}
                          onChange={(e) => updateUser({ timezone: e.target.value })}
                        >
                          {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="language" className="block text-sm font-medium mb-2">
                          Interface Language
                        </label>
                        <select
                          id="language"
                          className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                          value={user.language}
                          onChange={(e) => updateUser({ language: e.target.value })}
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Theme</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">System</p>
                          <p className="text-sm text-muted-foreground">Use system theme</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={user.theme === 'system'}
                        onChange={(e) => updateUser({ theme: e.target.value })}
                        className="h-4 w-4 accent-[hsl(var(--brand))]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sun className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Light</p>
                          <p className="text-sm text-muted-foreground">Light theme</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={user.theme === 'light'}
                        onChange={(e) => updateUser({ theme: e.target.value })}
                        className="h-4 w-4 accent-[hsl(var(--brand))]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Dark</p>
                          <p className="text-sm text-muted-foreground">Dark theme</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={user.theme === 'dark'}
                        onChange={(e) => updateUser({ theme: e.target.value })}
                        className="h-4 w-4 accent-[hsl(var(--brand))]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Email Notifications */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Email Notifications</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Translation Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified when translations are updated</p>
                      </div>
                      <Switch checked={user.notifications.email.translationUpdates} onChange={(checked) => updateNotifications('email', 'translationUpdates',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Review Requests</p>
                        <p className="text-sm text-muted-foreground">Get notified when reviews are requested</p>
                      </div>
                      <Switch checked={user.notifications.email.reviewRequests} onChange={(checked) => updateNotifications('email', 'reviewRequests',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Project Invites</p>
                        <p className="text-sm text-muted-foreground">Get notified when invited to projects</p>
                      </div>
                      <Switch checked={user.notifications.email.projectInvites} onChange={(checked) => updateNotifications('email', 'projectInvites',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of activity</p>
                      </div>
                      <Switch checked={user.notifications.email.weeklyDigest} onChange={(checked) => updateNotifications('email', 'weeklyDigest',checked)} />
                    </div>
                  </div>
                </div>

                {/* Browser Notifications */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Browser Notifications</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Translation Updates</p>
                        <p className="text-sm text-muted-foreground">Show browser notifications for updates</p>
                      </div>
                      <Switch checked={user.notifications.browser.translationUpdates} onChange={(checked) => updateNotifications('browser', 'translationUpdates',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Review Requests</p>
                        <p className="text-sm text-muted-foreground">Show browser notifications for reviews</p>
                      </div>
                      <Switch checked={user.notifications.browser.reviewRequests} onChange={(checked) => updateNotifications('browser', 'reviewRequests',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Project Invites</p>
                        <p className="text-sm text-muted-foreground">Show browser notifications for invites</p>
                      </div>
                      <Switch checked={user.notifications.browser.projectInvites} onChange={(checked) => updateNotifications('browser', 'projectInvites',checked)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="bg-card border border-border rounded-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Editor Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="defaultLanguage" className="block text-sm font-medium mb-2">
                      Default Language
                    </label>
                    <select
                      id="defaultLanguage"
                      className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                      value={user.preferences.defaultLanguage}
                      onChange={(e) => updatePreferences('defaultLanguage', e.target.value)}
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Key Paths</p>
                        <p className="text-sm text-muted-foreground">Display full key paths in the editor</p>
                      </div>
                      <Switch checked={user.preferences.showKeyPaths} onChange={(checked) => updatePreferences('showKeyPaths',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compact View</p>
                        <p className="text-sm text-muted-foreground">Use compact layout for translation tables</p>
                      </div>
                      <Switch checked={user.preferences.compactView} onChange={(checked) => updatePreferences('compactView',checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto Save</p>
                        <p className="text-sm text-muted-foreground">Automatically save changes as you type</p>
                      </div>
                      <Switch checked={user.preferences.autoSave} onChange={(checked) => updatePreferences('autoSave',checked)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Change Password */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Change Password</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      />
                    </div>

                    <Button onClick={handlePasswordChange} disabled={changingPassword || !passwordForm.new}>
                      {changingPassword ? 'Updating…' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                {/* Account Security */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Account Security</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Account Secure</p>
                        <p className="text-sm text-muted-foreground">Your account is secure and all security features are enabled.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <button className="px-3 py-2 border border-border rounded-md hover:bg-accent">
                          Enable
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Login Sessions</p>
                          <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                        </div>
                        <button className="px-3 py-2 border border-border rounded-md hover:bg-accent">
                          View
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">API Keys</p>
                          <p className="text-sm text-muted-foreground">Manage your API access</p>
                        </div>
                        <button className="px-3 py-2 border border-border rounded-md hover:bg-accent">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
