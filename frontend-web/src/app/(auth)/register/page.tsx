'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { register as registerUser } from '@/lib/api/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/registerSchema';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const fields: {
  name: keyof RegisterFormValues;
  label: string;
  type: string;
  autoComplete: string;
}[] = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { access_token, user } = await registerUser(values);
      setTokens(access_token);
      setUser(user);
      router.push('/dashboard');
    } catch {
      setError('root', { message: 'Registration failed. Please try again.' });
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Create account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <p className="text-sm text-[var(--color-error)]">{errors.root.message}</p>
        )}

        {fields.map(({ name, label, type, autoComplete }) => (
          <div key={name}>
            <label
              htmlFor={name}
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              {label}
            </label>
            <input
              id={name}
              type={type}
              autoComplete={autoComplete}
              {...register(name)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            {errors[name] && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors[name]?.message}</p>
            )}
          </div>
        ))}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
