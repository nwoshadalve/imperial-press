import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UiStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme:    (theme) => set({ theme }),
      toggleTheme: ()      => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'imperial-press-ui' },
  ),
)
