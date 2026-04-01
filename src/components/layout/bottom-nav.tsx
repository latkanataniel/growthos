'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  BookOpen,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Zadania', icon: CheckSquare },
  { href: '/habits', label: 'Nawyki', icon: Flame },
  { href: '/journal', label: 'Dziennik', icon: BookOpen },
  { href: '/stats', label: 'Statystyki', icon: BarChart3 },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200/50 dark:border-white/10 backdrop-blur-xl bg-white/72 dark:bg-neutral-900/72 shadow-sm">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname?.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 ease-out ${
                isActive
                  ? 'text-blue-600'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
