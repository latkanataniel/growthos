'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MoodChartProps {
  data: Array<{ date: string; mood: number }>
}

function getMoodColor(mood: number): string {
  if (mood <= 1) return '#ef4444'
  if (mood <= 2) return '#f97316'
  if (mood <= 3) return '#eab308'
  if (mood <= 4) return '#84cc16'
  return '#22c55e'
}

function CustomDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as {
    cx: number
    cy: number
    payload: { mood: number }
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={getMoodColor(payload.mood)}
      stroke="#fff"
      strokeWidth={2}
    />
  )
}

export function MoodChart({ data }: MoodChartProps) {
  const avgMood =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.mood, 0) / data.length
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Nastrój</span>
          <span
            className="text-sm font-normal"
            style={{ color: getMoodColor(Math.round(avgMood)) }}
          >
            Średnia: {avgMood.toFixed(1)}/5
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                labelStyle={{ color: '#64748b', fontWeight: 500 }}
                formatter={(value) => [`${value}/5`, 'Nastrój']}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
