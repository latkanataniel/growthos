'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { LogOut, Settings, Users, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  points: number
}

export function Topbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, points')
          .eq('id', user.id)
          .single()

        if (data) setProfile(data)
      }
    }

    load()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/50 dark:border-white/10 backdrop-blur-xl bg-white/72 dark:bg-neutral-900/72 shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <span className="text-lg font-bold tracking-tight">GrowthOS</span>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Points */}
          {profile && (
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-950/40">
              {profile.points} pkt
            </span>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200 ease-out">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-neutral-100 text-sm font-medium dark:bg-neutral-800">
                    {initials}
                  </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="cursor-pointer rounded-lg"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/team')}
                className="cursor-pointer rounded-lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Zesp&oacute;l
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="cursor-pointer rounded-lg"
              >
                <Settings className="mr-2 h-4 w-4" />
                Ustawienia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
