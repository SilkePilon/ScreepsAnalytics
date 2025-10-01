"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  creeps: { label: "Creeps", color: "hsl(217, 91%, 60%)" },
  spawns: { label: "Spawns", color: "hsl(217, 91%, 50%)" },
  towers: { label: "Towers", color: "hsl(217, 91%, 40%)" },
  extensions: { label: "Extensions", color: "hsl(217, 91%, 30%)" },
  storage: { label: "Storage", color: "hsl(217, 91%, 20%)" },
} satisfies ChartConfig

export function ServerBuildingTypesChart({ players }: { players: UserStats[] }) {
  const totals = players.reduce((acc, p) => ({
    creeps: acc.creeps + p.totalCreeps,
    spawns: acc.spawns + p.totalSpawns,
    towers: acc.towers + p.totalTowers,
    extensions: acc.extensions + p.totalExtensions,
    storage: acc.storage + p.totalStorage,
  }), { creeps: 0, spawns: 0, towers: 0, extensions: 0, storage: 0 })

  const chartData = [
    { name: "Creeps", value: totals.creeps, fill: "var(--color-creeps)" },
    { name: "Extensions", value: totals.extensions, fill: "var(--color-extensions)" },
    { name: "Towers", value: totals.towers, fill: "var(--color-towers)" },
    { name: "Spawns", value: totals.spawns, fill: "var(--color-spawns)" },
    { name: "Storage", value: totals.storage, fill: "var(--color-storage)" },
  ].filter(d => d.value > 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base">Building Types</CardTitle>
        <CardDescription className="text-xs">Server-wide distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={70}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
