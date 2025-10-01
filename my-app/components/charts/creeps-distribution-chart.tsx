"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  creeps: { label: "Creeps", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig

export function CreepsDistributionChart({ players }: { players: UserStats[] }) {
  const chartData = players
    .filter(p => p.totalCreeps > 0)
    .sort((a, b) => b.totalCreeps - a.totalCreeps)
    .slice(0, 15)
    .map(player => ({
      username: player.username,
      creeps: player.totalCreeps,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Creeps Distribution</CardTitle>
        <CardDescription className="text-xs">Top 15 players by creeps</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
            <Line 
              type="monotone" 
              dataKey="creeps" 
              stroke="var(--color-creeps)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-creeps)", r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
