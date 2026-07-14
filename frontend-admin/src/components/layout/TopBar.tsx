import { Menu, Moon, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/uiStore'

interface Props {
  onToggleMobileSidebar: () => void
}

export default function TopBar({ onToggleMobileSidebar }: Props) {
  const { theme, toggleTheme } = useUiStore()

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-white px-4 dark:bg-neutral-800 md:justify-end">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobileSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
