'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/types/database'
import { JournalHistoryCard } from '@/components/journal/journal-history-card'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import Link from 'next/link'

export default function JournalHistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .order('time_of_day')
        .limit(100)

      if (search) {
        query = query.ilike('content', `%${search}%`)
      }

      const { data } = await query
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Historia dziennika</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj we wpisach..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" count={5} />
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? 'Brak wyników wyszukiwania' : 'Brak wpisów w dzienniku'}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <JournalHistoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
