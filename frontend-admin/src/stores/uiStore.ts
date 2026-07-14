import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UiStore {
  theme: Theme
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      setTheme:             (theme)     => set({ theme }),
      toggleTheme:          ()          => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setSidebarCollapsed:  (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: 'imperial-press-ui' },
  ),
)
