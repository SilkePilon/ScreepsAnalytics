"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  towers: { label: "Towers", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig

export function TowerCountChart({ players }: { players: UserStats[] }) {
  const chartData = players
    .filter(p => p.totalTowers > 0)
    .sort((a, b) => b.totalTowers - a.totalTowers)
    .slice(0, 10)
    .map(player => ({
      username: player.username,
      towers: player.totalTowers,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Tower Owners</CardTitle>
        <CardDescription className="text-xs">Players with most towers</CardDescription>
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
            <Bar dataKey="towers" fill="var(--color-towers)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
