import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ApiKey, ApiKeyPermission, CreateApiKeyRequest, ApiKeyResponse } from '@/lib/types/api-key';
import { useToast } from '@/hooks/useToast';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';

interface ApiKeyContextValue {
  // State
  apiKeys: ApiKeyResponse[];
  loading: boolean;
  selectedProjectId?: string;

  // Actions
  fetchApiKeys: (projectId?: string) => Promise<void>;
  createApiKey: (data: CreateApiKeyRequest) => Promise<{ key?: string; error?: string }>;
  revokeApiKey: (keyId: string) => Promise<boolean>;
  updateApiKey: (keyId: string, updates: Partial<ApiKeyResponse>) => Promise<boolean>;
  setSelectedProject: (projectId?: string) => void;

  // Utilities
  hasPermission: (keyId: string, permission: ApiKeyPermission) => boolean;
  getActiveKeys: () => ApiKeyResponse[];
  getExpiredKeys: () => ApiKeyResponse[];
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const toast = useToast();

  // Fetch all API keys for the current user
  const fetchApiKeys = useCallback(async (projectId?: string) => {
    setLoading(true);
    try {
      const url = projectId
        ? `/api/user/api-keys?projectId=${projectId}`
        : '/api/user/api-keys';

      const response = await apiClient.get(url);
      const data = await handleApiResponse(response);

      if (data.success) {
        setApiKeys(data.apiKeys || []);
      } else {
        toast.error(data.error || 'Failed to load API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new API key
  const createApiKey = useCallback(async (data: CreateApiKeyRequest) => {
    try {
      const response = await apiClient.post('/api/user/api-keys', data);
      const result = await handleApiResponse(response);

      if (result.success && result.apiKey) {
        // Add the new key to the list (without the actual key value for security)
        const { key, ...keyData } = result.apiKey;
        setApiKeys(prev => [...prev, keyData]);
        toast.success('API key created successfully');

        // Return the key so it can be shown to the user once
        return { key };
      } else {
        throw new Error(result.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create API key';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  }, [toast]);

  // Revoke an API key
  const revokeApiKey = useCallback(async (keyId: string) => {
    try {
      const response = await apiClient.delete(`/api/user/api-keys/${keyId}`);
      const result = await handleApiResponse(response);

      if (result.success) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast.success('API key revoked successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
      return false;
    }
  }, [toast]);

  // Update an API key
  const updateApiKey = useCallback(async (keyId: string, updates: Partial<ApiKeyResponse>) => {
    try {
      const response = await apiClient.patch(`/api/user/api-keys/${keyId}`, updates);
      const result = await handleApiResponse(response);

      if (result.success && result.apiKey) {
        setApiKeys(prev => prev.map(key =>
          key.id === keyId ? { ...key, ...result.apiKey } : key
        ));
        toast.success('API key updated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to update API key');
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
      return false;
    }
  }, [toast]);

  // Set the selected project for filtering
  const setSelectedProject = useCallback((projectId?: string) => {
    setSelectedProjectId(projectId);
  }, []);

  // Check if a key has a specific permission
  const hasPermission = useCallback((keyId: string, permission: ApiKeyPermission) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return false;

    // Admin has all permissions
    if (key.permissions.includes('admin:all')) return true;

    return key.permissions.includes(permission);
  }, [apiKeys]);

  // Get active keys
  const getActiveKeys = useCallback(() => {
    const now = new Date();
    return apiKeys.filter(key =>
      key.isActive &&
      (!key.expiresAt || new Date(key.expiresAt) > now)
    );
  }, [apiKeys]);

  // Get expired keys
  const getExpiredKeys = useCallback(() => {
    const now = new Date();
    return apiKeys.filter(key =>
      key.expiresAt && new Date(key.expiresAt) <= now
    );
  }, [apiKeys]);

  // Initial load
  useEffect(() => {
    fetchApiKeys(selectedProjectId);
  }, [selectedProjectId, fetchApiKeys]);

  const value: ApiKeyContextValue = {
    // State
    apiKeys,
    loading,
    selectedProjectId,

    // Actions
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    updateApiKey,
    setSelectedProject,

    // Utilities
    hasPermission,
    getActiveKeys,
    getExpiredKeys,
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
}

// Custom hook to use the API Key context
export function useApiKeys() {
  const context = useContext(ApiKeyContext);

  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }

  return context;
}

// HOC to wrap components with API Key Provider
export function withApiKeyProvider<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <ApiKeyProvider>
        <Component {...props} />
      </ApiKeyProvider>
    );
  };
}
