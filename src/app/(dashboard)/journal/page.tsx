'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry, TimeOfDay } from '@/types/database'
import { JournalSession } from '@/components/journal/journal-session'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'
import Link from 'next/link'

export default function JournalPage() {
  const [entries, setEntries] = useState<Record<TimeOfDay, JournalEntry | undefined>>({
    morning: undefined,
    afternoon: undefined,
    evening: undefined,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)

      if (data) {
        const map: Record<TimeOfDay, JournalEntry | undefined> = {
          morning: undefined,
          afternoon: undefined,
          evening: undefined,
        }
        data.forEach((e: JournalEntry) => { map[e.time_of_day] = e })
        setEntries(map)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (timeOfDay: TimeOfDay, data: Partial<JournalEntry>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const existing = entries[timeOfDay]
    const entryData = {
      ...data,
      user_id: user.id,
      entry_date: today,
      time_of_day: timeOfDay,
    }

    if (existing) {
      const { error } = await supabase.from('journal_entries').update(entryData).eq('id', existing.id)
      if (error) { toast.error('Błąd zapisu'); return }
    } else {
      const { error } = await supabase.from('journal_entries').insert(entryData)
      if (error) { toast.error('Błąd zapisu'); return }
      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_amount: 5,
        p_reason: `Wpis dziennika: ${timeOfDay}`,
      })

      // Check if all 3 sessions are now complete
      const completedCount = Object.values(entries).filter(Boolean).length + 1
      if (completedCount === 3) {
        await supabase.rpc('award_points', {
          p_user_id: user.id,
          p_amount: 10,
          p_reason: 'Pełny dzień dziennika (bonus)',
        })
        toast.success('+10 pkt za pełny dzień dziennika!')
      }
    }

    toast.success('Wpis zapisany')

    // Reload entries
    const { data: updated } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('entry_date', today)
    if (updated) {
      const map: Record<TimeOfDay, JournalEntry | undefined> = { morning: undefined, afternoon: undefined, evening: undefined }
      updated.forEach((e: JournalEntry) => { map[e.time_of_day] = e })
      setEntries(map)
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dziennik</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: pl })}
          </p>
        </div>
        <Link href="/journal/history">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Historia
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {(['morning', 'afternoon', 'evening'] as const).map(time => (
          <JournalSession
            key={time}
            timeOfDay={time}
            entry={entries[time]}
            onSave={(data) => handleSave(time, data)}
          />
        ))}
      </div>
    </div>
  )
}
