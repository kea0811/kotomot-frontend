import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import { supabase } from '@/lib/supabase';
import {
  LayoutGrid,
  FolderOpen,
  Key,
  Activity,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  X,
  ChevronDown,
  User,
  Plus,
  Search,
  Bell,
  Languages,
  Users,
  Zap,
  Book,
  ClipboardCheck,
  GitBranch,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '@/components/ThemeSelector';
import { onApprovalUpdate } from '@/lib/events/approvalEvents';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
      { label: 'Projects', href: '/projects', icon: FolderOpen },
      { label: 'Teams', href: '/teams', icon: Users },
    ],
  },
  {
    label: 'Translation',
    items: [
      { label: 'Translations', href: '/translations', icon: Languages },
      { label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
      { label: 'Versions', href: '/versions', icon: GitBranch },
      { label: 'Environments', href: '/environments', icon: Layers },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Integrations', href: '/integrations', icon: Zap },
      { label: 'Activity', href: '/activity', icon: Activity },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'React SDK', href: '/docs/kotomot-react', icon: Book },
      { label: 'React Native SDK', href: '/docs/kotomot-react-native', icon: Book },
      { label: 'Node.js SDK', href: '/docs/kotomot-node-sdk', icon: Book },
      { label: 'Flutter SDK', href: '/docs/kotomot-flutter', icon: Book },
    ],
  },
];

const settingsNavigation: NavItem[] = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'AI Provider', href: '/settings', icon: Zap },
  { label: 'API Keys', href: '/settings/api-keys', icon: Key },
];

interface SidebarUser {
  name: string;
  email: string;
  initials: string;
}

function deriveUser(raw: {
  email?: string | null;
  user_metadata?: { name?: string; full_name?: string } | null;
} | null): SidebarUser {
  const email = raw?.email ?? '';
  const name =
    raw?.user_metadata?.name ||
    raw?.user_metadata?.full_name ||
    (email ? email.split('@')[0] : 'Account');
  const initials =
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';
  return { name, email, initials };
}

export default function AppLayout({ children }: { children?: React.ReactNode } = {}) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [canConfigureAI, setCanConfigureAI] = useState(false);
  const [navigation, setNavigation] = useState<NavGroup[]>(navigationGroups);
  const [isTeamOwner, setIsTeamOwner] = useState(true); // Default to true to show all items initially
  const [user, setUser] = useState<SidebarUser>({ name: 'Account', email: '', initials: 'U' });

  // Load the real authenticated user
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data?.user) setUser(deriveUser(data.user));
    });
    return () => {
      active = false;
    };
  }, []);

  // Check if user can configure AI settings and is team owner
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const teamsRes = await apiClient.get('/api/teams');
        const teamsData = await handleApiResponse(teamsRes);
        const teams = teamsData.teams || [];

        const ownsTeam = teams.some((team: { is_owner: boolean }) => team.is_owner);
        const notInAnyTeam = teams.length === 0;

        setCanConfigureAI(ownsTeam || notInAnyTeam);
        setIsTeamOwner(ownsTeam || notInAnyTeam);

        if (!ownsTeam && !notInAnyTeam) {
          const filteredNav = navigationGroups.map((group) => ({
            ...group,
            items: group.items.filter(
              (item) => !['Versions', 'Approvals', 'Environments'].includes(item.label)
            ),
          }));
          setNavigation(filteredNav);
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        setCanConfigureAI(false);
      }
    };

    checkUserAccess();
  }, []);

  // Fetch review and approval counts
  const fetchCounts = useCallback(async () => {
    if (!isTeamOwner) return;

    try {
      const reviewResponse = await apiClient.get('/api/reviews/count');
      const reviewResult = await handleApiResponse(reviewResponse);

      const approvalResponse = await apiClient.get('/api/approvals?filter=pending&role=approver');
      const approvalResult = await handleApiResponse(approvalResponse);
      const pendingCount =
        approvalResult.approvals?.filter((a: { can_approve: boolean }) => a.can_approve).length || 0;

      setNavigation((groups) =>
        groups.map((group) => ({
          ...group,
          items: group.items.map((item) => {
            if (item.label === 'Approvals') {
              const totalCount = pendingCount + (reviewResult.count || 0);
              return { ...item, badge: totalCount > 0 ? totalCount : undefined };
            }
            return item;
          }),
        }))
      );
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  }, [isTeamOwner]);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    const cleanup = onApprovalUpdate(() => {
      fetchCounts();
    });

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, [fetchCounts]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      // Always leave the authenticated area, even if signOut errored.
      navigate('/login', { replace: true });
    }
  };

  const isActive = (href: string) => {
    if (href === '/projects' && pathname?.startsWith('/projects')) return true;
    if (href === '/integrations' && pathname?.startsWith('/integrations')) return true;
    // Settings items (/settings, /settings/profile, /settings/api-keys) have
    // distinct paths — match exactly so only one highlights.
    return pathname === href;
  };

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setMobileMenuOpen(false)}
        title={!sidebarOpen ? item.label : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          sidebarOpen ? 'justify-start' : 'justify-center',
          active
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
        )}
      >
        {/* active left indicator */}
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand transition-opacity',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />
        <item.icon
          className={cn(
            'h-[18px] w-[18px] shrink-0 transition-colors',
            active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
        {sidebarOpen && item.badge && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-brand-foreground">
            {item.badge}
          </span>
        )}
        {!sidebarOpen && item.badge && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-card" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationProgress />

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        style={{ width: sidebarOpen ? 264 : 76 }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full',
          'border-r border-border bg-card',
          'transition-[width,transform] duration-200 ease-in-out lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className={cn(
              'flex h-16 items-center border-b border-border',
              sidebarOpen ? 'justify-between px-3.5' : 'justify-center px-2'
            )}
          >
            {sidebarOpen ? (
              <>
                <Link to="/projects" className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand shadow-brand">
                    <Languages className="h-5 w-5 text-brand-foreground" />
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[15px] font-semibold tracking-tight text-foreground">
                      Kotomot
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Translation Platform
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:block"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-[18px] w-[18px]" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </>
            ) : (
              /* Collapsed: logo mark doubles as the expand toggle (desktop) */
              <button
                onClick={() => setSidebarOpen(true)}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-brand"
                title="Expand sidebar"
              >
                <Languages className="h-5 w-5 text-brand-foreground transition-opacity group-hover:opacity-0" />
                <PanelLeft className="absolute h-[18px] w-[18px] text-brand-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {navigation.map((group, groupIndex) => (
              <div key={groupIndex}>
                {sidebarOpen && group.label && (
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">{group.items.map(renderNavLink)}</div>
              </div>
            ))}
          </nav>

          {/* Settings section */}
          <div className="border-t border-border px-3 py-3">
            {sidebarOpen && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Settings
              </p>
            )}
            <div className="space-y-0.5">
              {settingsNavigation
                .filter((item) => !(item.label === 'AI Provider' && !canConfigureAI))
                .map(renderNavLink)}
            </div>
          </div>

          {/* Logout section */}
          <div className="border-t border-border px-3 py-3">
            <button
              onClick={handleLogout}
              title={!sidebarOpen ? 'Logout' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
                sidebarOpen ? 'justify-start' : 'justify-center'
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'relative transition-[margin] duration-200 ease-in-out',
          sidebarOpen ? 'lg:ml-[264px]' : 'lg:ml-[76px]'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-48 rounded-lg border border-border bg-secondary/60 pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 lg:w-72"
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                  ⌘K
                </kbd>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                    >
                      <div className="p-2">
                        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                          Recent searches
                        </p>
                        <div className="space-y-0.5">
                          {['checkout.payment.title', 'common.button.save'].map((search) => (
                            <button
                              key={search}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-accent"
                            >
                              <Search className="h-3.5 w-3.5 text-muted-foreground" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/translations')}
                title="Create new translation"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-[18px] w-[18px]" />
              </button>

              <button
                onClick={() => console.log('Notifications feature not available')}
                title="Notifications"
                className="relative cursor-not-allowed rounded-md p-2 text-muted-foreground opacity-50"
                disabled
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>

              <ThemeToggle showDropdown iconSize={18} className="!p-2" />
              <ThemeToggleButton />

              <div className="mx-1 h-6 w-px bg-border" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                    {user.initials}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                    >
                      <div className="border-b border-border p-3">
                        <p className="truncate text-sm font-medium text-popover-foreground">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/settings/profile"
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-popover-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
