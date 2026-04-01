'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PeriodData {
  tasks: number
  habits: number
  journal: number
  points: number
}

interface PeriodComparisonProps {
  current: PeriodData
  previous: PeriodData
}

export function PeriodComparison({ current, previous }: PeriodComparisonProps) {
  const chartData = [
    { name: 'Zadania', current: current.tasks, previous: previous.tasks },
    { name: 'Nawyki', current: current.habits, previous: previous.habits },
    { name: 'Dziennik', current: current.journal, previous: previous.journal },
    { name: 'Punkty', current: current.points, previous: previous.points },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Porównanie okresów</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
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
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar
                dataKey="current"
                name="Bieżący okres"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="previous"
                name="Poprzedni okres"
                fill="#cbd5e1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
