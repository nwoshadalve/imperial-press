'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/lib/api/auth';
import { loginSchema, type LoginFormValues } from '@/lib/validation/loginSchema';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { access_token, user } = await login(values);
      setTokens(access_token);
      setUser(user);
      router.push('/dashboard');
    } catch {
      setError('root', { message: 'Invalid email or password.' });
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Sign in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <p className="text-sm text-[var(--color-error)]">{errors.root.message}</p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[var(--color-primary)] hover:underline">
          Register
        </Link>
      </p>
    </Card>
  );
}
