import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bot,
  Key,
  Globe,
  Server,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageVariants, cardVariants } from '@/lib/motion';
import Select from '@/components/ui/CustomSelect';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';

interface AIProviderSettings {
  provider: 'openai' | 'deepseek' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AIProviderSettings>({
    provider: 'openai',
    temperature: 0.3,
    maxTokens: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/settings/ai-provider');
      const data = await handleApiResponse(response);

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const response = await apiClient.post('/api/settings/ai-provider', settings);
      const data = await handleApiResponse(response);

      if (data.success) {
        setSaveStatus('success');
        // Update settings with the response (which has masked API key)
        if (data.settings) {
          setSettings(data.settings);
        }
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Test the connection by making a simple translation request
      const response = await apiClient.post('/api/translations/ai-suggest', {
        key: 'test.connection',
        targetLanguage: 'Spanish',
        sourceText: 'Hello',
      });
      const data = await handleApiResponse(response);

      if (data.success && data.suggestion && !data.suggestion.includes('[ES]')) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }
  };

  const providerConfig = {
    openai: {
      name: 'OpenAI',
      description: 'Use OpenAI\'s GPT models for high-quality translations',
      models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
      defaultModel: 'gpt-4-turbo-preview',
      baseUrl: 'https://api.openai.com/v1',
      docsUrl: 'https://platform.openai.com/api-keys',
    },
    deepseek: {
      name: 'DeepSeek',
      description: 'Cost-effective AI translations with DeepSeek\'s language model',
      models: ['deepseek-chat'],
      defaultModel: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com',
      docsUrl: 'https://platform.deepseek.com/api-keys',
    },
    custom: {
      name: 'Custom Provider',
      description: 'Use any OpenAI-compatible API endpoint',
      models: [],
      defaultModel: '',
      baseUrl: '',
      docsUrl: '',
    },
  };

  const currentProvider = providerConfig[settings.provider];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 w-full"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your AI translation provider and preferences
        </p>
      </div>

      {/* AI Provider Settings */}
      <motion.div
        variants={cardVariants}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-border bg-brand/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-semibold text-foreground">
                AI Translation Provider
              </h2>
            </div>
            {connectionStatus === 'success' && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Connection failed</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(providerConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSettings({
                    ...settings,
                    provider: key as 'openai' | 'deepseek' | 'custom',
                    baseUrl: config.baseUrl,
                    model: config.defaultModel,
                  })}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    settings.provider === key
                      ? 'border-brand bg-brand/5'
                      : 'border-border hover:border-brand/40'
                  }`}
                >
                  {settings.provider === key && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-brand" />
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">
                      {config.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              API Key
              {currentProvider.docsUrl && (
                <a
                  href={currentProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Key className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey || ''}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder={`Enter your ${currentProvider.name} API key`}
                className="w-full pl-10 pr-10 py-2 text-sm text-foreground placeholder-gray-500 dark:placeholder-gray-400 bg-card border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {settings.apiKey?.includes('...') && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                API key is already saved. Enter a new key to update it.
              </p>
            )}
          </div>

          {/* Model Selection */}
          {currentProvider.models.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Model
              </label>
              <Select
                label="Model"
                value={settings.model || ''}
                onChange={(value) => setSettings({ ...settings, model: value })}
                options={currentProvider.models.map((model) => ({
                  value: model,
                  label: model
                }))}
                className="w-full"
              />
            </div>
          )}

          {/* Custom Provider Settings */}
          {settings.provider === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Base URL
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Server className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={settings.baseUrl || ''}
                    onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full pl-10 pr-3 py-2 text-sm text-foreground placeholder-gray-500 dark:placeholder-gray-400 bg-card border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={settings.model || ''}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="Enter model name"
                  className="w-full px-3 py-2 text-sm text-foreground placeholder-gray-500 dark:placeholder-gray-400 bg-card border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={testConnection}
              disabled={testingConnection || !settings.apiKey || settings.apiKey.includes('...')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-accent hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved successfully</span>
                </div>
              )}
              {saveStatus === 'error' && errorMessage && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Information Card */}
      <motion.div
        variants={cardVariants}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              About AI Translations
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              AI-powered translations provide quick, contextual suggestions for your translation keys.
              While AI translations are helpful, we recommend having them reviewed by native speakers
              for the best quality.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your API keys are stored securely and are never exposed to other users. They are only
              used for generating translation suggestions when you click the "AI Suggest" button.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
