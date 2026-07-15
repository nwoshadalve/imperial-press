import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Layers,
  FileText,
  PenSquare,
  Globe,
  AlignLeft,
  Bell,
  Megaphone,
  Package,
  Link2,
  Inbox,
  Users,
  ClipboardList,
  CheckSquare,
  CreditCard,
  Award,
  Settings,
  Library,
  LayoutTemplate,
  Radio,
  Scale,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Nav data ────────────────────────────────────────────────────────────────

type IconType = React.ComponentType<{ className?: string }>

interface NavItem {
  path: string
  label: string
  icon: IconType
}

interface NavGroup {
  key: string
  label: string
  icon: IconType
  items: NavItem[]
}

const topItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

/** Split into focused sections so no single accordion holds the whole tree. */
const groups: NavGroup[] = [
  {
    key: 'publishing',
    label: 'Publishing',
    icon: Library,
    items: [
      { path: '/content/subjects', label: 'Subjects',         icon: Tag      },
      { path: '/content/journals', label: 'Journals',         icon: BookOpen },
      { path: '/content/issues',   label: 'Volumes & Issues', icon: Layers   },
      { path: '/content/papers',   label: 'Papers',           icon: FileText },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    icon: LayoutTemplate,
    items: [
      { path: '/content/blog',         label: 'Blog Posts',    icon: PenSquare },
      { path: '/content/services',     label: 'Service Pages', icon: Globe     },
      { path: '/content/static-pages', label: 'Static Pages',  icon: AlignLeft },
    ],
  },
  {
    key: 'outreach',
    label: 'Outreach',
    icon: Radio,
    items: [
      { path: '/content/announcements',   label: 'Announcements',       icon: Bell      },
      { path: '/content/call-for-papers', label: 'Call for Papers',     icon: Megaphone },
      { path: '/content/packages',        label: 'Packages',            icon: Package   },
      { path: '/content/partners',        label: 'Partners & Indexing', icon: Link2     },
    ],
  },
  {
    key: 'editorial',
    label: 'Editorial',
    icon: Scale,
    items: [
      { path: '/editorial/submissions', label: 'Submissions', icon: Inbox         },
      { path: '/editorial/reviewers',   label: 'Reviewers',   icon: Users         },
      { path: '/editorial/assignments', label: 'Assignments', icon: ClipboardList },
      { path: '/editorial/decisions',   label: 'Decisions',   icon: CheckSquare   },
    ],
  },
]

const bottomItems: NavItem[] = [
  { path: '/payments',     label: 'Payments',     icon: CreditCard },
  { path: '/certificates', label: 'Certificates', icon: Award      },
  { path: '/users',        label: 'Users',        icon: Users      },
  { path: '/settings',     label: 'Settings',     icon: Settings   },
]

// ─── Nav row ─────────────────────────────────────────────────────────────────

function NavRow({ item, nested = false }: { item: NavItem; nested?: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'group flex cursor-pointer items-center gap-2.5 border-l-2 py-[7px] pr-3 text-[13px] transition-all duration-150',
          nested ? 'pl-4' : 'pl-[10px]',
          isActive
            ? [
                'border-primary-500 bg-primary-50 font-semibold text-primary-700',
                'dark:border-primary-400 dark:bg-primary-900/25 dark:text-primary-300',
              ]
            : [
                'border-transparent font-medium text-neutral-600',
                'hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900',
                'dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200',
              ],
        )
      }
    >
      <Icon
        className={cn(
          'shrink-0 transition-colors duration-150',
          nested ? 'h-3.5 w-3.5' : 'h-4 w-4',
        )}
      />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

// ─── Nav group — accordion, controlled ───────────────────────────────────────

function NavGroupSection({
  group,
  isOpen,
  onToggle,
}: {
  group: NavGroup
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = group.icon

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all duration-150',
          isOpen
            ? 'text-neutral-900 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        {/* inline SVG avoids a React Fast Refresh race with forwardRef icons in dev */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-0' : '-rotate-90',
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* CSS grid trick: animates from 0fr → 1fr without measuring height */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col pb-1 pt-0.5">
            {group.items.map(item => (
              <NavRow key={item.path} item={item} nested />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Nav content ─────────────────────────────────────────────────────────────

function SidebarNav() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  function toggle(key: string) {
    setOpenKey(prev => (prev === key ? null : key))
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3">
      <div className="mb-1 flex flex-col">
        {topItems.map(item => (
          <NavRow key={item.path} item={item} />
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        {groups.map(group => (
          <NavGroupSection
            key={group.key}
            group={group}
            isOpen={openKey === group.key}
            onToggle={() => toggle(group.key)}
          />
        ))}
      </div>

      <div className="mx-3 my-3 h-px bg-[var(--color-border)]" />

      <div className="flex flex-col">
        {bottomItems.map(item => (
          <NavRow key={item.path} item={item} />
        ))}
      </div>
    </nav>
  )
}

// ─── Shared surface / edge styles ────────────────────────────────────────────

/** Sidebar body (nav scroll area + panel chrome) */
const sidebarSurface = 'bg-white dark:bg-neutral-950'

/** Logo strip — same surface as TopBar/navbar in both themes */
const brandSurface = 'bg-[var(--color-bg)]'

/** Same rule used by the nav divider (`h-px bg-[var(--color-border)]`) */
const sidebarEdge = 'border-b border-[var(--color-border)]'

// ─── Brand ───────────────────────────────────────────────────────────────────

function Brand() {
  return (
    <div className={cn('flex h-14 shrink-0 items-center gap-3 px-4', brandSurface, sidebarEdge)}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary-700 text-xs font-bold text-white">
        IP
      </div>
      <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Imperial Press
      </span>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-20 hidden w-56 flex-col shadow-[2px_0_12px_rgba(0,0,0,0.07)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.35)] md:flex',
          sidebarSurface,
        )}
      >
        <Brand />
        <div className={cn('flex flex-1 flex-col overflow-hidden', sidebarSurface)}>
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile drawer — always mounted so CSS transitions play */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-[visibility] duration-300',
          mobileOpen ? 'visible' : 'invisible',
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onMobileClose}
        />
        {/* Panel */}
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-64 flex-col shadow-[2px_0_12px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-in-out dark:shadow-[2px_0_12px_rgba(0,0,0,0.35)]',
            sidebarSurface,
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Mobile brand header — same surface as TopBar/navbar */}
          <div className={cn('flex h-14 shrink-0 items-center justify-between px-4', brandSurface, sidebarEdge)}>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center bg-primary-700 text-xs font-bold text-white">
                IP
              </div>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Imperial Press
              </span>
            </div>
            <button
              type="button"
              onClick={onMobileClose}
              className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarNav />
        </aside>
      </div>
    </>
  )
}
