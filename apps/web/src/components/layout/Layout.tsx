import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { FloralIntro } from '../brand/FloralIntro'
import { ToastViewport } from '../ui/ToastViewport'
import { Footer } from './Footer'
import { Header } from './Header'
import { SceneBackground } from './SceneBackground'
import { WhatsAppButton } from './WhatsAppButton'

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <>
        {children}
        <ToastViewport />
      </>
    )
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <FloralIntro />
      <SceneBackground />
      <Header />
      <main className="relative flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ToastViewport />
    </div>
  )
}
