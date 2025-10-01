"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  creeps: {
    label: "Active Creeps",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function TopCreepOwnersChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .sort((a, b) => b.totalCreeps - a.totalCreeps)
    .slice(0, 10)
    .map(p => ({
      username: p.username,
      creeps: p.totalCreeps,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Creep Owners</CardTitle>
        <CardDescription className="text-xs">Players with most active creeps</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 10, top: 5, bottom: 0 }}
          >
            <XAxis type="number" dataKey="creeps" hide />
            <YAxis
              dataKey="username"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={60}
              fontSize={10}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="creeps" fill="var(--color-creeps)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
