import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <TopBar onToggleMobileSidebar={() => setMobileOpen(o => !o)} />
      <main className="min-h-screen overflow-auto bg-white p-4 pt-[calc(3.5rem+1rem)] shadow-[0_0_16px_rgba(0,0,0,0.07)] dark:bg-neutral-950 dark:shadow-[0_0_16px_rgba(0,0,0,0.35)] md:ml-56 md:p-6 md:pt-[calc(3.5rem+1.5rem)]">
        <Outlet />
      </main>
    </div>
  )
}
