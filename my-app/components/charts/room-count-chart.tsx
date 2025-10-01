"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  rooms: {
    label: "Rooms",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function RoomCountChart({ players }: { players: UserStats[] }) {
  const roomCounts = [
    { count: "1", players: players.filter(p => p.rooms === 1).length },
    { count: "2", players: players.filter(p => p.rooms === 2).length },
    { count: "3", players: players.filter(p => p.rooms === 3).length },
    { count: "4+", players: players.filter(p => p.rooms >= 4).length },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Room Count</CardTitle>
        <CardDescription className="text-xs">Players by number of rooms</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={roomCounts} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="count"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              fontSize={10}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="players" fill="var(--color-rooms)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
