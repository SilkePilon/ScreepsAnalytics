"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  creeps: {
    label: "Creeps",
    color: "hsl(217, 91%, 60%)",
  },
  towers: {
    label: "Towers",
    color: "hsl(217, 91%, 50%)",
  },
  spawns: {
    label: "Spawns",
    color: "hsl(217, 91%, 40%)",
  },
} satisfies ChartConfig

export function ServerActivityChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .sort((a, b) => b.gcl - a.gcl)
    .slice(0, 12)
    .reverse()
    .map(p => ({
      username: p.username.slice(0, 8),
      creeps: p.totalCreeps,
      towers: p.totalTowers * 5,
      spawns: p.totalSpawns * 10,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Server Activity</CardTitle>
        <CardDescription className="text-xs">Military units and infrastructure</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 5, top: 5, bottom: 0 }}
            stackOffset="expand"
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
              dataKey="spawns"
              type="natural"
              fill="var(--color-spawns)"
              fillOpacity={0.1}
              stroke="var(--color-spawns)"
              stackId="a"
            />
            <Area
              dataKey="towers"
              type="natural"
              fill="var(--color-towers)"
              fillOpacity={0.4}
              stroke="var(--color-towers)"
              stackId="a"
            />
            <Area
              dataKey="creeps"
              type="natural"
              fill="var(--color-creeps)"
              fillOpacity={0.4}
              stroke="var(--color-creeps)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
