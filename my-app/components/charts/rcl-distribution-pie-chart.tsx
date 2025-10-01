"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  rcl1: { label: "RCL 1-2", color: "hsl(217, 91%, 60%)" },
  rcl3: { label: "RCL 3-4", color: "hsl(217, 91%, 50%)" },
  rcl5: { label: "RCL 5-6", color: "hsl(217, 91%, 40%)" },
  rcl7: { label: "RCL 7-8", color: "hsl(217, 91%, 30%)" },
} satisfies ChartConfig

export function RCLDistributionPieChart({ players }: { players: UserStats[] }) {
  const rclData = [
    { name: "RCL 1-2", value: players.filter(p => p.avgRCL > 0 && p.avgRCL <= 2).length, fill: "var(--color-rcl1)" },
    { name: "RCL 3-4", value: players.filter(p => p.avgRCL > 2 && p.avgRCL <= 4).length, fill: "var(--color-rcl3)" },
    { name: "RCL 5-6", value: players.filter(p => p.avgRCL > 4 && p.avgRCL <= 6).length, fill: "var(--color-rcl5)" },
    { name: "RCL 7-8", value: players.filter(p => p.avgRCL > 6).length, fill: "var(--color-rcl7)" },
  ].filter(d => d.value > 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base">RCL Distribution</CardTitle>
        <CardDescription className="text-xs">Players by avg room level</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={rclData} dataKey="value" nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
