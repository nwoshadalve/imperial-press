import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    try {
      // TODO: replace with real API call — POST /api/v1/auth/admin/login
      await new Promise(r => setTimeout(r, 800))

      if (data.email !== 'admin@imperialpress.com') {
        setError('root', { message: 'Invalid email or password.' })
        return
      }

      setAuth(
        { id: '1', email: data.email, name: 'Site Admin', role: 'admin' },
        'mock-access-token',
      )
      navigate('/dashboard', { replace: true })
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Imperial Press</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-[var(--color-text)]">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@imperialpress.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-[var(--color-error)]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-[var(--color-error)]">{errors.password.message}</p>
              )}
            </div>

            {/* Root error */}
            {errors.root && (
              <p className="rounded-lg bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" className="mt-1 w-full min-h-11" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          Admin access only. Contact your system administrator if you need access.
        </p>
      </div>
    </div>
  )
}
