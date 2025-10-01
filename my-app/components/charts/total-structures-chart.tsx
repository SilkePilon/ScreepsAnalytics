"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  total: {
    label: "Total Structures",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function TotalStructuresChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .map(p => ({
      username: p.username.slice(0, 8),
      total: p.totalCreeps + p.totalSpawns + p.totalTowers + p.totalExtensions + p.totalStorage,
    }))
    .filter(p => p.total > 0)
    .sort((a, b) => a.total - b.total)
    .slice(-12)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Total Structures</CardTitle>
        <CardDescription className="text-xs">All buildings & creeps combined</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 10, top: 5, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="username"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="total"
              type="monotone"
              fill="var(--color-total)"
              fillOpacity={0.4}
              stroke="var(--color-total)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
