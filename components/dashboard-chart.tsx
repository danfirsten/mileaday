"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Run } from "@/lib/types"

type ChartData = {
  date: string
  actual: number
  target: number
}

export function DashboardChart({ runs }: { runs: Run[] }) {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    if (runs.length === 0) return

    // Sort runs by date
    const sortedRuns = [...runs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate cumulative miles
    let cumulativeMiles = 0
    const chartData: ChartData[] = sortedRuns.map((run) => {
      cumulativeMiles += run.distance
      const date = new Date(run.date)
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)

      return {
        date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        actual: cumulativeMiles,
        target: dayOfYear, // 1 mile per day is the target
      }
    })

    setData(chartData)
  }, [runs])

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data to display. Start logging your runs!</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={30}
          tick={{ fontSize: 12 }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                      <span className="font-bold text-sm">{payload[0].payload.date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Miles</span>
                      <span className="font-bold text-sm">{payload[0].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Target</span>
                      <span className="font-bold text-sm">{payload[1].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Difference</span>
                      <span className="font-bold text-sm">{(payload[0].value - payload[1].value).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

