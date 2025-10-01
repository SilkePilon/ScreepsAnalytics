"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  spawns: {
    label: "Spawns",
    color: "hsl(217, 91%, 60%)",
  },
  towers: {
    label: "Towers",
    color: "hsl(217, 91%, 45%)",
  },
} satisfies ChartConfig

export function MilitaryInfraChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .filter(p => p.totalSpawns > 0 || p.totalTowers > 0)
    .sort((a, b) => (b.totalSpawns + b.totalTowers) - (a.totalSpawns + a.totalTowers))
    .slice(0, 10)
    .map(p => ({
      username: p.username.slice(0, 10),
      spawns: p.totalSpawns,
      towers: p.totalTowers,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Infrastructure</CardTitle>
        <CardDescription className="text-xs">Spawns and towers by player</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="username"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              fontSize={10}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="spawns" fill="var(--color-spawns)" radius={4} />
            <Bar dataKey="towers" fill="var(--color-towers)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
