"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  players: {
    label: "Players",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function GCLDistributionChart({ players }: { players: UserStats[] }) {
  const gclRanges = [
    { range: "0-100K", min: 0, max: 100000 },
    { range: "100K-500K", min: 100000, max: 500000 },
    { range: "500K-1M", min: 500000, max: 1000000 },
    { range: "1M-5M", min: 1000000, max: 5000000 },
    { range: "5M+", min: 5000000, max: Infinity },
  ]

  const chartData = gclRanges.map(({ range, min, max }) => ({
    range,
    players: players.filter(p => p.gcl >= min && p.gcl < max).length,
  }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">GCL Distribution</CardTitle>
        <CardDescription className="text-xs">Player count by GCL range</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              fontSize={10}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="players" fill="var(--color-players)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
