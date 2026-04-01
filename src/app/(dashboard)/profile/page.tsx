'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { LevelProgress } from '@/components/gamification/level-progress'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      role: profile.role,
      skills: profile.skills,
      goals: profile.goals,
      responsibilities: profile.responsibilities,
      timezone: profile.timezone,
    }).eq('id', profile.id)
    setSaving(false)
    if (error) { toast.error('Błąd zapisu'); return }
    toast.success('Profil zaktualizowany')
  }

  if (loading) return <LoadingSkeleton variant="form" />
  if (!profile) return null

  return (
    <div className="space-y-6 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Profil</h1>

      <LevelProgress points={profile.points} />

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Imię i nazwisko</Label>
          <Input
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Rola / Stanowisko</Label>
          <Input
            value={profile.role || ''}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            placeholder="np. Product Manager, Developer..."
          />
        </div>

        <div className="space-y-2">
          <Label>Umiejętności (oddzielone przecinkami)</Label>
          <Input
            value={profile.skills?.join(', ') || ''}
            onChange={(e) => setProfile({
              ...profile,
              skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
            })}
            placeholder="np. JavaScript, zarządzanie projektami, UX..."
          />
        </div>

        <div className="space-y-2">
          <Label>Cele</Label>
          <Textarea
            value={profile.goals || ''}
            onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
            placeholder="Opisz swoje cele zawodowe i osobiste..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Obowiązki</Label>
          <Textarea
            value={profile.responsibilities || ''}
            onChange={(e) => setProfile({ ...profile, responsibilities: e.target.value })}
            placeholder="Opisz swoje główne obowiązki..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Strefa czasowa</Label>
          <Input
            value={profile.timezone || ''}
            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
            placeholder="Europe/Warsaw"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Zapisywanie...' : 'Zapisz profil'}
        </Button>
      </Card>
    </div>
  )
}
