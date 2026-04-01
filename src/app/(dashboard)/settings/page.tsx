'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [signingOut, setSigningOut] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    toast.success('Wylogowano')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="space-y-6 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Ustawienia</h1>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-3">Wygląd</h2>
          <div className="flex items-center justify-between">
            <div>
              <Label>Tryb ciemny</Label>
              <p className="text-sm text-muted-foreground">Przełącz między jasnym a ciemnym motywem</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="font-semibold mb-3">Konto</h2>
          <Button variant="destructive" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {signingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
