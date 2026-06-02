import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/motion';

export default function SetupPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const envVars = {
    mongodb: import.meta.env.VITE_MONGODB_URI || '',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };

  const isConfigured = {
    mongodb: envVars.mongodb && envVars.mongodb !== 'your_mongodb_connection_string',
    supabase:
      envVars.supabaseUrl &&
      envVars.supabaseUrl !== 'your_supabase_project_url' &&
      envVars.supabaseKey &&
      envVars.supabaseKey !== 'your_supabase_anon_key',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Kotomot Setup Guide</h1>
        <p className="text-muted-foreground mb-8">
          Follow these steps to configure your translation management system
        </p>

        {/* Status Overview */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {isConfigured.mongodb ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">MongoDB Atlas</span>
              <span className="text-sm text-muted-foreground">
                {isConfigured.mongodb ? 'Connected' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isConfigured.supabase ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Supabase Auth</span>
              <span className="text-sm text-muted-foreground">
                {isConfigured.supabase ? 'Configured' : 'Not configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {/* MongoDB Setup */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                {isConfigured.mongodb ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">1. MongoDB Atlas Setup</h3>
                <ol className="space-y-3 text-sm">
                  <li>
                    <div className="flex items-center gap-2">
                      <span>1. Create a free cluster at</span>
                      <a
                        href="https://www.mongodb.com/cloud/atlas/register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        MongoDB Atlas
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li>2. Create a database user and password</li>
                  <li>3. Whitelist your IP address (or allow all IPs for development)</li>
                  <li>4. Get your connection string from "Connect" &rarr; "Connect your application"</li>
                  <li>
                    <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span>MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/koto?retryWrites=true&w=majority</span>
                        <button
                          onClick={() => copyToClipboard('MONGODB_URI=your_mongodb_connection_string', 'mongodb')}
                          className="ml-2 p-1 hover:bg-accent rounded"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {copiedText === 'mongodb' && (
                        <span className="text-xs text-green-500 mt-1">Copied!</span>
                      )}
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Supabase Setup */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                {isConfigured.supabase ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">2. Supabase Auth Setup</h3>
                <ol className="space-y-3 text-sm">
                  <li>
                    <div className="flex items-center gap-2">
                      <span>1. Create a new project at</span>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Supabase Dashboard
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li>2. Go to Settings &rarr; API</li>
                  <li>3. Copy your Project URL and anon public key</li>
                  <li>4. Enable Email Auth in Authentication &rarr; Providers</li>
                  <li>
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-muted rounded-md font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span>VITE_SUPABASE_URL=https://your-project.supabase.co</span>
                          <button
                            onClick={() => copyToClipboard('VITE_SUPABASE_URL=your_supabase_url', 'url')}
                            className="ml-2 p-1 hover:bg-accent rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {copiedText === 'url' && (
                          <span className="text-xs text-green-500 mt-1">Copied!</span>
                        )}
                      </div>
                      <div className="p-3 bg-muted rounded-md font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span>VITE_SUPABASE_ANON_KEY=your-anon-key</span>
                          <button
                            onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=your_anon_key', 'key')}
                            className="ml-2 p-1 hover:bg-accent rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {copiedText === 'key' && (
                          <span className="text-xs text-green-500 mt-1">Copied!</span>
                        )}
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Environment File Setup */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">3. Update Environment Variables</h3>
            <ol className="space-y-3 text-sm">
              <li>1. Open your <code className="px-1 py-0.5 bg-muted rounded">.env.local</code> file</li>
              <li>2. Replace the placeholder values with your actual credentials</li>
              <li>3. Restart the development server after updating</li>
            </ol>
            <div className="mt-4 p-3 bg-muted rounded-md">
              <code className="text-xs">
                npm run dev
              </code>
            </div>
          </div>

          {/* Success Message */}
          {isConfigured.mongodb && isConfigured.supabase && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Setup Complete!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your application is configured and ready to use.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Demo Mode Available</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                You can explore the UI without setting up databases by visiting the{' '}
                <Link to="/projects" className="underline">
                  projects page
                </Link>
                . The application uses mock data for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
