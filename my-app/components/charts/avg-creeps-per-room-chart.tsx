"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  avg: { label: "Avg per Room", color: "hsl(217, 91%, 60%)" },
} satisfies ChartConfig

export function AvgCreepsPerRoomChart({ players }: { players: UserStats[] }) {
  const chartData = players
    .filter(p => p.rooms > 0 && p.totalCreeps > 0)
    .map(p => ({
      username: p.username,
      avg: Math.round((p.totalCreeps / p.rooms) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Avg Creeps per Room</CardTitle>
        <CardDescription className="text-xs">Top efficiency ratios</CardDescription>
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
            <Bar dataKey="avg" fill="var(--color-avg)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
