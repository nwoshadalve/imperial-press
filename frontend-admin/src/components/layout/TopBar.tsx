import { Bell, Menu, Moon, Sun, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { cn } from '@/lib/utils/cn'

interface Props {
  onToggleMobileSidebar: () => void
}

export default function TopBar({ onToggleMobileSidebar }: Props) {
  const { theme, toggleTheme } = useUiStore()
  const { user, logout } = useAuthStore()
  const { unreadCount, markAllRead } = useNotificationStore()

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 md:left-56">
      {/* Left — mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer md:hidden"
        onClick={onToggleMobileSidebar}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer — pushes right actions to the edge on desktop */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          onClick={markAllRead}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] text-[10px] font-bold text-white',
                unreadCount > 9 && 'px-1 w-auto',
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="h-5 w-5" />
            : <Moon className="h-5 w-5" />
          }
        </Button>

        {/* User menu — modal={false} prevents body scroll lock */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-[var(--color-text)] sm:block">
              {user?.name ?? 'Admin'}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{user?.email ?? ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-[var(--color-error)] focus:text-[var(--color-error)]">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
