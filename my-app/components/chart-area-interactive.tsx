"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { UserStats } from "@/lib/screeps-api"

const chartConfig = {
  gcl: {
    label: "GCL",
    color: "var(--primary)",
  },
  rooms: {
    label: "Rooms",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  players: UserStats[]
}

export function ChartAreaInteractive({ players }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("10")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("5")
    }
  }, [isMobile])

  const chartData = React.useMemo(() => {
    const topPlayers = players
      .sort((a, b) => b.gcl - a.gcl)
      .slice(0, parseInt(timeRange))
    
    return topPlayers.map((player, index) => ({
      player: player.username.slice(0, 10),
      gcl: player.gcl,
      rooms: player.rooms * 10,
      index,
    }))
  }, [players, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Players Comparison</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            GCL and room count for top players
          </span>
          <span className="@[540px]/card:hidden">Top players</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="10">Top 10</ToggleGroupItem>
            <ToggleGroupItem value="20">Top 20</ToggleGroupItem>
            <ToggleGroupItem value="5">Top 5</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Top 10" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="10" className="rounded-lg">
                Top 10
              </SelectItem>
              <SelectItem value="20" className="rounded-lg">
                Top 20
              </SelectItem>
              <SelectItem value="5" className="rounded-lg">
                Top 5
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillGcl" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-gcl)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-gcl)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRooms" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rooms)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rooms)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="player"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Player: ${value}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="rooms"
              type="natural"
              fill="url(#fillRooms)"
              stroke="var(--color-rooms)"
              stackId="a"
            />
            <Area
              dataKey="gcl"
              type="natural"
              fill="url(#fillGcl)"
              stroke="var(--color-gcl)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
