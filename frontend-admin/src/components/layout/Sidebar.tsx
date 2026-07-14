import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, BookOpen, Users, DollarSign,
  ShieldCheck, User, Settings, PenSquare, ChevronDown, X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

const singleItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const groups: NavGroup[] = [
  {
    key: 'content',
    label: 'Content',
    icon: BookOpen,
    items: [
      { path: '/content/subjects', label: 'Subjects', icon: FileText },
      { path: '/content/journals', label: 'Journals', icon: FileText },
      { path: '/content/issues', label: 'Volumes & Issues', icon: FileText },
      { path: '/content/papers', label: 'Papers', icon: FileText },
      { path: '/content/blog', label: 'Blog Posts', icon: FileText },
      { path: '/content/services', label: 'Service Pages', icon: FileText },
      { path: '/content/static-pages', label: 'Static Pages', icon: FileText },
      { path: '/content/announcements', label: 'Announcements', icon: FileText },
      { path: '/content/call-for-papers', label: 'Call for Papers', icon: FileText },
      { path: '/content/packages', label: 'Packages', icon: FileText },
      { path: '/content/partners', label: 'Partners & Indexing', icon: FileText },
    ],
  },
  {
    key: 'editorial',
    label: 'Editorial',
    icon: PenSquare,
    items: [
      { path: '/editorial/submissions', label: 'Submissions', icon: FileText },
      { path: '/editorial/reviewers', label: 'Reviewers', icon: Users },
      { path: '/editorial/assignments', label: 'Assignments', icon: FileText },
      { path: '/editorial/decisions', label: 'Decisions', icon: FileText },
    ],
  },
]

const trailingItems: NavItem[] = [
  { path: '/payments', label: 'Payments', icon: DollarSign },
  { path: '/certificates', label: 'Certificates', icon: ShieldCheck },
  { path: '/users', label: 'Users', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
]

interface Props {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white',
          isActive && 'bg-primary-900 text-white',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

function NavGroupSection({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(true)
  const Icon = group.icon

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1">
        {group.items.map(item => (
          <NavRow key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">{group.label}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-neutral-800 pl-3">
          {group.items.map(item => (
            <NavRow key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
      {singleItems.map(item => (
        <NavRow key={item.path} item={item} collapsed={collapsed} />
      ))}
      {groups.map(group => (
        <NavGroupSection key={group.key} group={group} collapsed={collapsed} />
      ))}
      {trailingItems.map(item => (
        <NavRow key={item.path} item={item} collapsed={collapsed} />
      ))}
    </nav>
  )
}

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col bg-neutral-900 transition-[width] duration-200',
          collapsed ? 'md:w-14' : 'md:w-56',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-center px-4">
          {!collapsed && <span className="truncate text-sm font-bold text-primary-400">Imperial Press</span>}
        </div>
        <SidebarContent collapsed={collapsed} />
        <button
          type="button"
          onClick={() => onCollapse(!collapsed)}
          className="border-t border-neutral-800 px-3 py-2 text-xs text-neutral-500 hover:text-white"
        >
          {collapsed ? '»' : '« Collapse'}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-neutral-900">
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <span className="truncate text-sm font-bold text-primary-400">Imperial Press</span>
              <button type="button" onClick={onMobileClose} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}
    </>
  )
}
