"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Run } from "@/lib/types"

type MonthData = {
  name: string
  miles: number
  target?: number
}

export function MonthlyChart({ runs, showTarget = false }: { runs: Run[]; showTarget?: boolean }) {
  const [data, setData] = useState<MonthData[]>([])

  useEffect(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize monthly data
    const monthlyData: { [key: string]: number } = {}
    months.forEach((month) => {
      monthlyData[month] = 0
    })

    // Sum miles by month
    runs.forEach((run) => {
      const date = new Date(run.date)
      const month = months[date.getMonth()]
      monthlyData[month] += run.distance
    })

    // Convert to chart data format
    const chartData: MonthData[] = months.map((month) => {
      const data: MonthData = {
        name: month,
        miles: monthlyData[month],
      }

      if (showTarget) {
        // Target is roughly 30 miles per month (365/12)
        data.target = 30.4
      }

      return data
    })

    setData(chartData)
  }, [runs, showTarget])

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data to display</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 12 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-sm">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Miles</span>
                      <span className="font-bold text-sm">{payload[0].value.toFixed(1)}</span>
                    </div>
                    {showTarget && (
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Target</span>
                        <span className="font-bold text-sm">{payload[1]?.value.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="miles" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        {showTarget && <Bar dataKey="target" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />}
      </BarChart>
    </ResponsiveContainer>
  )
}

