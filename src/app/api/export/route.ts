import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get('format') || 'json'

  const [tasks, habits, completions, journal, points] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_completions').select('*').eq('user_id', user.id),
    supabase.from('journal_entries').select('*').eq('user_id', user.id),
    supabase.from('point_events').select('*').eq('user_id', user.id),
  ])

  const data = {
    tasks: tasks.data || [],
    habits: habits.data || [],
    habit_completions: completions.data || [],
    journal_entries: journal.data || [],
    point_events: points.data || [],
    exported_at: new Date().toISOString(),
  }

  if (format === 'csv') {
    const lines: string[] = []

    // Tasks CSV
    lines.push('--- TASKS ---')
    lines.push('id,title,category,status,priority,due_date,completed_at,created_at')
    data.tasks.forEach(t => {
      lines.push(`"${t.id}","${t.title}","${t.category}","${t.status}","${t.priority}","${t.due_date || ''}","${t.completed_at || ''}","${t.created_at}"`)
    })

    lines.push('')
    lines.push('--- HABITS ---')
    lines.push('id,name,frequency,current_streak,longest_streak')
    data.habits.forEach(h => {
      lines.push(`"${h.id}","${h.name}","${h.frequency}",${h.current_streak},${h.longest_streak}`)
    })

    lines.push('')
    lines.push('--- JOURNAL ---')
    lines.push('id,entry_date,time_of_day,mood,content')
    data.journal_entries.forEach(j => {
      const content = (j.content || '').replace(/"/g, '""')
      lines.push(`"${j.id}","${j.entry_date}","${j.time_of_day}",${j.mood || ''},"${content}"`)
    })

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=growthos-export.csv',
      },
    })
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': 'attachment; filename=growthos-export.json',
    },
  })
}
