import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { pageVariants } from '@/lib/motion';
import { AlertCircle, Languages, Loader2 } from 'lucide-react';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch (err: any) {
      setIsConfigured(false);
      console.error('Supabase configuration error:', err.message);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    if (!supabase) {
      setError('Authentication is not configured. Please complete the setup first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      navigate('/projects');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass =
    'block h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="flex min-h-screen w-full">
      {/* Brand panel (left) — always dark */}
      <AuthBrandPanel />

      {/* Form panel (right) */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-14"
      >
        <div className="w-full max-w-[360px]">
          {!isConfigured ? (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <h3 className="font-semibold text-foreground">Setup required</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supabase authentication is not configured yet. Complete the setup to enable
                    login.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link
                      to="/setup"
                      className="block w-full rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
                    >
                      Go to setup guide
                    </Link>
                    <Link
                      to="/projects"
                      className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Continue in demo mode
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Mobile logo (brand panel hidden on small screens) */}
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
                  <Languages className="h-5 w-5 text-brand-foreground" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">Kotomot</span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={fieldClass}
                    placeholder="you@company.com"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-medium text-foreground">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError('Password reset is not available yet.')}
                      className="text-xs font-medium text-brand transition-opacity hover:opacity-80"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className={fieldClass}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-medium text-brand-foreground shadow-sm transition-all hover:bg-brand/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
