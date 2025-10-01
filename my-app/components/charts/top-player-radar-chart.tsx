"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function TopPlayerRadarChart({ players }: { players: UserStats[] }) {
  if (players.length === 0) return null
  
  const topPlayer = [...players].sort((a, b) => b.gcl - a.gcl)[0]
  
  const maxValues = {
    gcl: Math.max(...players.map(p => p.gcl)),
    rooms: Math.max(...players.map(p => p.rooms)),
    creeps: Math.max(...players.map(p => p.totalCreeps)),
    towers: Math.max(...players.map(p => p.totalTowers)),
    extensions: Math.max(...players.map(p => p.totalExtensions)),
    avgRCL: 8,
  }

  const chartData = [
    { category: "GCL", value: (topPlayer.gcl / maxValues.gcl) * 100 },
    { category: "Rooms", value: (topPlayer.rooms / maxValues.rooms) * 100 },
    { category: "Creeps", value: (topPlayer.totalCreeps / maxValues.creeps) * 100 },
    { category: "Towers", value: (topPlayer.totalTowers / maxValues.towers) * 100 },
    { category: "Extensions", value: (topPlayer.totalExtensions / maxValues.extensions) * 100 },
    { category: "Avg RCL", value: (topPlayer.avgRCL / maxValues.avgRCL) * 100 },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base">Top Player Profile</CardTitle>
        <CardDescription className="text-xs">{topPlayer.username}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full max-h-[200px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" fontSize={10} />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
              dot={{ r: 3, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
