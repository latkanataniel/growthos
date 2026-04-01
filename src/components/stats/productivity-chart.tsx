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

interface ProductivityChartProps {
  data: Array<{ date: string; completed: number }>
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktywność (ostatnie 30 dni)</CardTitle>
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
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                labelStyle={{ color: '#64748b', fontWeight: 500 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
