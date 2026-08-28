import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Tags,
} from 'lucide-react'
import { BrandLogo } from '../components/brand/BrandLogo'
import { useAdminAuth } from './AdminAuth'

const links = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/categories', label: 'Categorías', icon: Tags },
  { to: '/admin/attributes', label: 'Colores y tallas', icon: Palette },
  { to: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
]

export function AdminLayout() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const signOut = () => {
    void logout().then(() => navigate('/admin/login'))
  }

  return (
    <div className="min-h-dvh bg-atelier-cream text-atelier-dark">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <aside className="hidden w-64 shrink-0 bg-atelier-dark p-5 text-atelier-cream md:flex md:flex-col">
          <BrandLogo size="sm" to="/" />
          <p className="mt-4 text-[10px] font-semibold tracking-[0.18em] text-atelier-soft-gold uppercase">
            Panel Atelier
          </p>
          <p className="mt-1 truncate text-xs text-atelier-cream/70">{user?.email}</p>

          <nav className="mt-8 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-atelier-gold text-white'
                      : 'text-atelier-cream/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <link.icon className="h-4 w-4" strokeWidth={1.6} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="mt-auto flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-atelier-peach hover:bg-white/10"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-atelier-blush bg-atelier-white px-4 py-3 md:hidden">
            <BrandLogo size="sm" to="/admin" />
            <button type="button" className="text-sm font-semibold text-atelier-danger" onClick={signOut}>
              Salir
            </button>
          </header>

          <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-atelier-blush bg-atelier-white px-3 py-2 md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-atelier-dark text-atelier-white'
                      : 'bg-atelier-soft-pink text-atelier-dark'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
