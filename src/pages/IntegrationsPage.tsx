import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { pageVariants, cardVariants } from '@/lib/motion';
import IntegrationRequestModal from '@/components/IntegrationRequestModal';
import {
  Zap,
  MessageSquare,
  Github,
  Webhook,
  Mail,
  Globe,
  Settings,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Shield,
  Users,
  GitBranch,
  Activity,
  Code,
  FileCode,
  Database,
  Cloud,
  Calendar,
  Video,
  Key,
  Bell,
  TrendingUp,
  Package,
  Layers,
  Terminal,
  Bot,
  Sparkles,
  Lock,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  Zap as Lightning,
  Server,
  Cpu,
  HardDrive,
  BarChart3,
  FileText,
  Slack,
  Send
} from 'lucide-react';
import Select from '@/components/ui/CustomSelect';

// Custom icons for specific services
const BrandIcons = {
  slack: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  ),
  discord: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  github: Github,
  gitlab: GitBranch,
  jira: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.486a.976.976 0 0 0-.975-.973h-.029zM5.232 5.274h6.341v6.264a5.218 5.218 0 0 1-5.215 5.213H5.232V5.274zm6.365-5.27A5.218 5.218 0 0 0 6.364 5.218v.054h5.233a.976.976 0 0 0 .975-.973V.005zM18.79 5.274H12.45a5.218 5.218 0 0 0 5.213 5.214v5.26h-.054A5.218 5.218 0 0 0 22.823 21h.002c.022 0 .04-.003.057-.003v-10.51a5.218 5.218 0 0 0-4.091-5.213z"/>
    </svg>
  ),
  teams: Users,
  notion: FileText,
  linear: BarChart3,
  figma: Layers,
  stripe: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
    </svg>
  )
};

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'development' | 'analytics' | 'automation' | 'storage' | 'monitoring' | 'payment' | 'productivity';
  icon: any;
  status: 'available' | 'coming-soon' | 'beta' | 'premium';
  features: string[];
  setupTime?: string;
  popular?: boolean;
  new?: boolean;
}

const integrations: Integration[] = [
  // Currently Available
  {
    id: 'slack',
    name: 'Slack',
    description: 'Real-time messaging and notifications for your team',
    category: 'communication',
    icon: BrandIcons.slack,
    status: 'available',
    features: ['Channel notifications', 'Direct messages', 'Rich formatting', 'Thread support', 'File attachments', 'Mentions'],
    setupTime: '2 min',
    popular: true
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Send HTTP notifications to any custom endpoint',
    category: 'automation',
    icon: Webhook,
    status: 'available',
    features: ['Custom endpoints', 'JSON payloads', 'Secret validation', 'Retry logic', 'Event filtering', 'Headers customization'],
    setupTime: '1 min',
    popular: false
  },

  // Coming Soon
  {
    id: 'lark',
    name: 'Lark',
    description: 'All-in-one collaboration suite for global teams',
    category: 'communication',
    icon: MessageSquare, // Will add custom Lark icon later
    status: 'coming-soon',
    features: ['Chat notifications', 'Document sync', 'Calendar integration', 'Video meetings', 'Task management', 'Wiki'],
    setupTime: '3 min',
    new: true
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', icon: Layers },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'automation', name: 'Automation', icon: Zap }
];

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'coming-soon' | 'beta' | 'premium'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'coming-soon':
        return 'bg-muted text-gray-700 dark:text-gray-400 border-border';
      case 'beta':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'premium':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-muted text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'coming-soon':
        return 'Coming Soon';
      case 'beta':
        return 'Beta';
      case 'premium':
        return 'Premium';
      default:
        return status;
    }
  };

  const stats = {
    total: integrations.length,
    available: integrations.filter(i => i.status === 'available').length,
    comingSoon: integrations.filter(i => i.status === 'coming-soon').length,
    beta: integrations.filter(i => i.status === 'beta').length,
    premium: integrations.filter(i => i.status === 'premium').length
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Kotomot with your favorite tools and services
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={cardVariants} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Available Now</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
                <p className="text-xs text-muted-foreground mt-1">Slack & Webhook ready</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Coming Soon</p>
                <p className="mt-1 text-2xl font-bold text-muted-foreground">{stats.comingSoon}</p>
                <p className="text-xs text-muted-foreground mt-1">Lark integration in progress</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as any)}
            options={[
              { value: "all", label: "All Status" },
              { value: "available", label: "Available" },
              { value: "coming-soon", label: "Coming Soon" }
            ]}
            className="min-w-[140px]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-brand text-brand-foreground border-indigo-600'
                    : 'bg-card text-foreground border-border hover:border-brand/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
                {category.id === 'all' && (
                  <span className="ml-1 text-xs opacity-75">
                    {filteredIntegrations.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={integration.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <Icon className="w-5 h-5 text-foreground group-hover:text-brand dark:group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {integration.name}
                          {integration.popular && (
                            <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                              Popular
                            </span>
                          )}
                          {integration.new && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                              New
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {integration.setupTime && `${integration.setupTime} setup`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-900 text-muted-foreground rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="px-2 py-1 text-xs text-muted-foreground">
                          +{integration.features.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(integration.status)}`}>
                        {getStatusLabel(integration.status)}
                      </span>

                      {integration.status === 'available' ? (
                        <button
                          onClick={() => navigate(`/integrations/${integration.id}`)}
                          className="flex items-center gap-1 text-sm font-medium text-brand hover:text-indigo-700 dark:hover:text-indigo-300">
                          Configure
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : integration.status === 'beta' ? (
                        <button className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          Join Beta
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : integration.status === 'premium' ? (
                        <button className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                          Upgrade
                          <Lock className="w-3 h-3" />
                        </button>
                      ) : (
                        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-not-allowed" disabled>
                          Notify Me
                          <Bell className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-4">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <Search className="absolute -bottom-1 -right-1 w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No integrations found
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Try adjusting your search or filters to find what you're looking for
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-brand rounded-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">More integrations coming soon!</h3>
            <p className="text-sm opacity-90">
              We're working on adding more integrations. Let us know what you need.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors"
            >
              Request Integration
            </button>
            <button className="px-4 py-2 bg-white text-brand hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Integration Request Modal */}
      <IntegrationRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </motion.div>
  );
}
