import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';

interface IntegrationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularIntegrations = [
  'Jira',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Linear',
  'Notion',
  'Asana',
  'Trello',
  'Microsoft Teams',
  'Discord',
  'Figma',
  'Confluence',
  'Other'
];

export default function IntegrationRequestModal({ isOpen, onClose }: IntegrationRequestModalProps) {
  const [formData, setFormData] = useState({
    integrationName: '',
    companyName: '',
    email: '',
    useCase: '',
    priority: 'medium',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/integrations/request', formData);
      const result = await handleApiResponse(response);

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset form after closing
          setTimeout(() => {
            setFormData({
              integrationName: '',
              companyName: '',
              email: '',
              useCase: '',
              priority: 'medium',
              additionalInfo: ''
            });
            setIsSuccess(false);
          }, 300);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntegrationSelect = (integration: string) => {
    setFormData({ ...formData, integrationName: integration });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Request Sent Successfully!
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll review your integration request and get back to you soon.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Request Integration
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Popular Integrations */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Integration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {popularIntegrations.map((integration) => (
                    <button
                      key={integration}
                      type="button"
                      onClick={() => handleIntegrationSelect(integration)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.integrationName === integration
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {integration}
                    </button>
                  ))}
                </div>
                {formData.integrationName === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    className="mt-2 w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your company name"
                  className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                >
                  <option value="low">Low - Nice to have</option>
                  <option value="medium">Medium - Would be helpful</option>
                  <option value="high">High - Critical for our workflow</option>
                </select>
              </div>

              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Use Case
                </label>
                <textarea
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                  placeholder="How would you use this integration? What problems would it solve?"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 resize-none"
                  required
                />
              </div>

              {/* Additional Information */}
              {formData.integrationName !== 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    placeholder="Any specific features or requirements?"
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg shadow-xs transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 resize-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSubmitting || !formData.integrationName || !formData.email}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
