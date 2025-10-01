"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  storage: {
    label: "Storage",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function StorageCountChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .filter(p => p.totalStorage > 0)
    .sort((a, b) => b.totalStorage - a.totalStorage)
    .slice(0, 10)
    .map(p => ({
      username: p.username.slice(0, 10),
      storage: p.totalStorage,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Storage Buildings</CardTitle>
        <CardDescription className="text-xs">Players with most storage</CardDescription>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
