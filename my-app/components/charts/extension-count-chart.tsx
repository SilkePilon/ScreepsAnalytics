"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  extensions: {
    label: "Extensions",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig

export function ExtensionCountChart({ players }: { players: UserStats[] }) {
  const chartData = [...players]
    .filter(p => p.totalExtensions > 0)
    .sort((a, b) => b.gcl - a.gcl)
    .slice(0, 15)
    .reverse()
    .map(p => ({
      username: p.username.slice(0, 8),
      extensions: p.totalExtensions,
    }))

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Extension Count</CardTitle>
        <CardDescription className="text-xs">Total extensions by top players</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 5, top: 5, bottom: 0 }}
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
              dataKey="extensions"
              type="natural"
              fill="var(--color-extensions)"
              fillOpacity={0.4}
              stroke="var(--color-extensions)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
