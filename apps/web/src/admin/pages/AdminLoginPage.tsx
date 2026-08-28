import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { Button } from '../../components/ui/Button'
import { ApiError } from '../../lib/api'
import { useAdminAuth } from '../AdminAuth'

export function AdminLoginPage() {
  const { user, loading, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@atelier.mx')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user?.email) {
    const from = (location.state as { from?: string } | null)?.from || '/admin'
    return <Navigate to={from} replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-atelier-cream px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-atelier-blush bg-atelier-white shadow-atelier">
        <div className="bg-atelier-gradient px-6 py-8 text-center">
          <div className="flex justify-center">
            <BrandLogo size="lg" to={null} />
          </div>
          <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-atelier-dark/70 uppercase">
            Acceso administración
          </p>
        </div>

        <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 px-6 py-6">
          <label className="block text-sm font-medium text-atelier-dark">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-atelier-blush bg-atelier-cream px-3 text-atelier-dark"
            />
          </label>

          <label className="block text-sm font-medium text-atelier-dark">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-atelier-blush bg-atelier-cream px-3 text-atelier-dark"
            />
          </label>

          {error ? <p className="text-sm text-atelier-danger">{error}</p> : null}
          {typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? (
            <p className="text-xs leading-relaxed text-atelier-gray">
              En internet el admin aún no tiene servidor. En tu PC abre{' '}
              <a className="font-semibold text-atelier-gold underline" href="http://localhost:5173/admin/login">
                http://localhost:5173/admin/login
              </a>
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
