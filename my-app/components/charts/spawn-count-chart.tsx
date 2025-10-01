"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  spawns: { label: "Spawns", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig

export function SpawnCountChart({ players }: { players: UserStats[] }) {
  const chartData = players
    .filter(p => p.totalSpawns > 0)
    .sort((a, b) => b.totalSpawns - a.totalSpawns)
    .slice(0, 10)
    .map(player => ({
      username: player.username,
      spawns: player.totalSpawns,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Spawn Owners</CardTitle>
        <CardDescription className="text-xs">Players with most spawns</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="username" 
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="spawns" fill="var(--color-spawns)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
