import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { pageVariants } from '@/lib/motion';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { AlertCircle, CheckCircle, Languages, Loader2 } from 'lucide-react';

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch (err: any) {
      console.error('Supabase configuration error:', err.message);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    if (!supabase) {
      setError('Authentication is not configured. Please complete the setup first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation link to complete your registration. Redirecting you to
                sign in…
              </p>
              <Link to="/login" className="text-sm font-medium text-brand hover:opacity-80">
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Mobile logo (brand panel hidden on small screens) */}
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
                  <Languages className="h-5 w-5 text-brand-foreground" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">Koto</span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Create account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Get started with your free account
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
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    className={fieldClass}
                    placeholder="At least 8 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className={fieldClass}
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                  {isLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                Already have an account?
                <Link to="/login" className="font-medium text-brand hover:opacity-80">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
