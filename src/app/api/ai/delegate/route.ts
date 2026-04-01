import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDelegation } from '@/lib/ai/claude'
import { buildDelegationPrompt } from '@/lib/ai/delegation-prompt'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Rate limit check: 20 per day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('point_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('reason', 'AI delegation analysis')
      .gte('created_at', today.toISOString())

    if ((count ?? 0) >= 20) {
      return NextResponse.json({ error: 'Limit dzienny analizy AI osiągnięty (20/dzień)' }, { status: 429 })
    }

    // Get task, profile, team
    const [taskRes, profileRes, teamRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('id', taskId).eq('user_id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('team_members').select('*').eq('user_id', user.id),
    ])

    if (!taskRes.data) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (!profileRes.data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const prompt = buildDelegationPrompt(taskRes.data, profileRes.data, teamRes.data || [])
    const result = await analyzeDelegation(prompt)

    // Log the usage
    await supabase.from('point_events').insert({
      user_id: user.id,
      points: 0,
      reason: 'AI delegation analysis',
      reference_id: taskId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI delegation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
