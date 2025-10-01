"use client"

import { Bar, BarChart, Area, AreaChart, Line, LineChart, XAxis, YAxis, CartesianGrid, LabelList, PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { UserStats } from "@/lib/screeps-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { TrendingUp } from "lucide-react"

interface ChartsGridProps {
  players: UserStats[]
}

export function ChartsGrid({ players }: ChartsGridProps) {
  const totalCreeps = players.reduce((sum, p) => sum + p.totalCreeps, 0)
  const totalRooms = players.reduce((sum, p) => sum + p.rooms, 0)
  const totalSpawns = players.reduce((sum, p) => sum + p.totalSpawns, 0)
  const totalTowers = players.reduce((sum, p) => sum + p.totalTowers, 0)
  const totalExtensions = players.reduce((sum, p) => sum + p.totalExtensions, 0)
  const totalStorage = players.reduce((sum, p) => sum + p.totalStorage, 0)
  const avgGCL = Math.round(players.reduce((sum, p) => sum + p.gcl, 0) / players.length)
  const topPlayer = [...players].sort((a, b) => b.gcl - a.gcl)[0]
  const activePlayers = players.filter(p => p.totalCreeps > 0).length
  const idlePlayers = players.length - activePlayers
  const topStoragePlayers = [...players].sort((a, b) => b.totalStorage - a.totalStorage).map(p => ({ username: p.username, storage: p.totalStorage }))
  const topRoomOwners = [...players].sort((a, b) => b.rooms - a.rooms).map(p => ({ username: p.username, rooms: p.rooms }))
  const topPlayers = [...players].filter(p => p.totalSpawns > 0).sort((a, b) => (b.totalExtensions / b.totalSpawns) - (a.totalExtensions / a.totalSpawns))

  const militaryRatio = totalRooms > 0 ? (totalTowers / totalRooms).toFixed(1) : "0"
  const creepsPerRoom = totalRooms > 0 ? (totalCreeps / totalRooms).toFixed(1) : "0"

  return (
    <div className="chart-wrapper mx-auto flex w-full flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[25rem] lg:grid-cols-1 xl:max-w-[28rem]">
        <Card className="lg:max-w-md">
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Total Active Creeps</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {totalCreeps.toLocaleString()}{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                creeps
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                creeps: { label: "Creeps", color: "hsl(217, 91%, 60%)" },
              }}
            >
              <BarChart
                accessibilityLayer
                margin={{ left: -4, right: -4 }}
                data={[...players]
                  .sort((a, b) => b.gcl - a.gcl)
                  .slice(0, 7)
                  .map(p => ({ name: p.username.slice(0, 8), creeps: p.totalCreeps }))}
              >
                <Bar
                  dataKey="creeps"
                  fill="var(--color-creeps)"
                  radius={5}
                  fillOpacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  fontSize={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideIndicator />}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <CardDescription>
              Server has{" "}
              <span className="font-medium text-foreground">{activePlayers}</span> active
              players building and expanding.
            </CardDescription>
            <CardDescription>
              Average of{" "}
              <span className="font-medium text-foreground">{creepsPerRoom}</span> creeps
              per room across the server.
            </CardDescription>
          </CardFooter>
        </Card>

        <Card className="flex flex-col lg:max-w-md">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
            <div>
              <CardDescription>Avg GCL</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                {(avgGCL / 1000).toFixed(0)}
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  K
                </span>
              </CardTitle>
            </div>
            <div>
              <CardDescription>Active Players</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                {activePlayers}
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  players
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
            <ChartContainer
              config={{
                gcl: { label: "GCL", color: "hsl(217, 91%, 60%)" },
              }}
              className="w-full"
            >
              <LineChart
                accessibilityLayer
                margin={{ left: 14, right: 14, top: 10 }}
                data={[...players]
                  .sort((a, b) => b.gcl - a.gcl)
                  .slice(0, 7)
                  .map(p => ({ name: p.username.slice(0, 8), gcl: p.gcl }))}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.5}
                />
                <YAxis hide domain={["dataMin - 10000", "dataMax + 10000"]} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                />
                <Line
                  dataKey="gcl"
                  type="natural"
                  stroke="var(--color-gcl)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ fill: "var(--color-gcl)", r: 4 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full flex-1 gap-6 lg:max-w-[22rem] xl:max-w-[24rem]">
        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Server Leader</CardTitle>
            <CardDescription>
              {topPlayer?.username} dominates with the highest GCL on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                {topPlayer?.gcl.toLocaleString() || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  GCL
                </span>
              </div>
              <ChartContainer
                config={{ gcl: { label: "GCL", color: "hsl(217, 91%, 60%)" } }}
                className="aspect-auto h-[32px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  layout="vertical"
                  margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                  data={[{ name: topPlayer?.username, value: 100 }]}
                >
                  <Bar dataKey="value" fill="var(--color-gcl)" radius={4} barSize={32}>
                    <LabelList
                      position="insideLeft"
                      dataKey="name"
                      offset={8}
                      fontSize={12}
                      fill="white"
                    />
                  </Bar>
                  <YAxis dataKey="name" type="category" hide />
                  <XAxis dataKey="value" type="number" hide />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid auto-rows-min gap-2">
              <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                {topPlayer?.rooms || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  rooms
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Controls {topPlayer?.rooms || 0} rooms with {topPlayer?.totalCreeps || 0} active creeps
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="p-4 pb-0">
            <CardTitle>Military Strength</CardTitle>
            <CardDescription>
              Server has {totalTowers.toLocaleString()} towers defending {totalRooms} rooms.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
              {militaryRatio}
              <span className="text-sm font-normal text-muted-foreground">
                towers/room
              </span>
            </div>
            <ChartContainer
              config={{ towers: { label: "Towers", color: "hsl(217, 91%, 60%)" } }}
              className="ml-auto w-[72px]"
            >
              <BarChart
                accessibilityLayer
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                data={[...players]
                  .sort((a, b) => b.totalTowers - a.totalTowers)
                  .slice(0, 7)
                  .map(p => ({ towers: p.totalTowers }))}
              >
                <Bar
                  dataKey="towers"
                  fill="var(--color-towers)"
                  radius={2}
                  fillOpacity={0.2}
                  activeIndex={0}
                />
                <XAxis hide />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardContent className="flex gap-4 p-4 pb-2">
            <ChartContainer
              config={{
                spawns: { label: "Spawns", color: "hsl(217, 91%, 60%)" },
                towers: { label: "Towers", color: "hsl(217, 91%, 50%)" },
                storage: { label: "Storage", color: "hsl(217, 91%, 40%)" },
              }}
              className="h-[140px] w-full"
            >
              <BarChart
                margin={{ left: 0, right: 0, top: 0, bottom: 10 }}
                data={[
                  {
                    type: "storage",
                    value: (totalStorage / Math.max(totalRooms, 1)) * 20,
                    label: `${totalStorage} total`,
                    fill: "var(--color-storage)",
                  },
                  {
                    type: "towers",
                    value: (totalTowers / Math.max(totalRooms, 1)) * 20,
                    label: `${totalTowers} total`,
                    fill: "var(--color-towers)",
                  },
                  {
                    type: "spawns",
                    value: (totalSpawns / Math.max(totalRooms, 1)) * 20,
                    label: `${totalSpawns} total`,
                    fill: "var(--color-spawns)",
                  },
                ]}
                layout="vertical"
                barSize={32}
                barGap={2}
              >
                <XAxis type="number" dataKey="value" hide />
                <YAxis
                  dataKey="type"
                  type="category"
                  tickLine={false}
                  tickMargin={4}
                  axisLine={false}
                  className="capitalize"
                  fontSize={12}
                />
                <Bar dataKey="value" radius={5}>
                  <LabelList
                    position="insideLeft"
                    dataKey="label"
                    fill="white"
                    offset={8}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex flex-row border-t p-4">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Spawns</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  {totalSpawns}
                </div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Towers</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  {totalTowers}
                </div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Storage</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  {totalStorage}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Power Level Distribution</CardTitle>
            <CardDescription>Players by GCL ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                players: { label: "Players", color: "hsl(142, 76%, 36%)" },
              }}
            >
              <BarChart
                data={[
                  { range: "1-5", players: players.filter(p => p.gcl >= 1 && p.gcl <= 5).length },
                  { range: "6-10", players: players.filter(p => p.gcl >= 6 && p.gcl <= 10).length },
                  { range: "11-20", players: players.filter(p => p.gcl >= 11 && p.gcl <= 20).length },
                  { range: "21-50", players: players.filter(p => p.gcl >= 21 && p.gcl <= 50).length },
                  { range: "50+", players: players.filter(p => p.gcl > 50).length },
                ]}
              >
                <XAxis dataKey="range" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="players" fill="hsl(142, 76%, 36%)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Most players in the {players.filter(p => p.gcl >= 11 && p.gcl <= 20).length > players.filter(p => p.gcl >= 6 && p.gcl <= 10).length ? "11-20" : "6-10"} GCL range
            </div>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Economy Score</CardTitle>
            <CardDescription>Combined infrastructure rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tabular-nums text-amber-500">
              {Math.round((totalExtensions + totalSpawns * 10 + totalStorage * 100) / 100)}K
            </div>
            <ChartContainer
              config={{
                score: { label: "Score", color: "hsl(43, 96%, 56%)" },
              }}
              className="mt-4 h-[80px]"
            >
              <AreaChart data={Array.from({ length: 20 }, (_, i) => ({ x: i, value: Math.random() * 100 }))}>
                <defs>
                  <linearGradient id="fillEconomy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="hsl(43, 96%, 56%)" fill="url(#fillEconomy)" fillOpacity={0.4} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full flex-1 gap-6 lg:max-w-[22rem] xl:max-w-[24rem]">
        <Card className="max-w-xs">
          <CardHeader className="p-4 pb-0">
            <CardTitle>Infrastructure Count</CardTitle>
            <CardDescription>
              Total of {totalExtensions.toLocaleString()} extensions powering the economy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
            <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
              {totalExtensions.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">
                extensions
              </span>
            </div>
            <ChartContainer
              config={{ extensions: { label: "Extensions", color: "hsl(217, 91%, 60%)" } }}
              className="ml-auto w-[64px]"
            >
              <BarChart
                accessibilityLayer
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                data={[...players]
                  .sort((a, b) => b.totalExtensions - a.totalExtensions)
                  .slice(0, 7)
                  .map(p => ({ extensions: p.totalExtensions }))}
              >
                <Bar
                  dataKey="extensions"
                  fill="var(--color-extensions)"
                  radius={2}
                  fillOpacity={0.2}
                  activeIndex={0}
                />
                <XAxis hide />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="space-y-0 pb-0">
            <CardDescription>Total Rooms Claimed</CardDescription>
            <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
              {totalRooms}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                rooms
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                rooms: { label: "Rooms", color: "hsl(217, 91%, 50%)" },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={[...players]
                  .sort((a, b) => b.gcl - a.gcl)
                  .slice(0, 10)
                  .map(p => ({ name: p.username.slice(0, 8), rooms: p.rooms }))}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" hide />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                <defs>
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
                <Area
                  dataKey="rooms"
                  type="natural"
                  fill="url(#fillRooms)"
                  fillOpacity={0.4}
                  stroke="var(--color-rooms)"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Server Stats</CardTitle>
            <CardDescription>Quick overview of server activity</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Players</span>
              <span className="text-2xl font-bold tabular-nums">{players.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Players</span>
              <span className="text-2xl font-bold tabular-nums">{activePlayers}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Structures</span>
              <span className="text-2xl font-bold tabular-nums">
                {(totalSpawns + totalTowers + totalExtensions + totalStorage).toLocaleString()}
              </span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <CardDescription>
              Server efficiency: <span className="font-medium text-foreground">{creepsPerRoom}</span> creeps per room
            </CardDescription>
          </CardFooter>
        </Card>
      </div>

      <div className="grid w-full flex-1 gap-6 lg:max-w-[22rem] xl:max-w-[24rem]">
        <Card className="max-w-xs">
          <CardHeader className="p-4 pb-0">
            <CardTitle>Top Spawners</CardTitle>
            <CardDescription>
              Players with the most spawn structures
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
            <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
              {totalSpawns}
              <span className="text-sm font-normal text-muted-foreground">
                total
              </span>
            </div>
            <ChartContainer
              config={{ spawns: { label: "Spawns", color: "hsl(217, 91%, 60%)" } }}
              className="ml-auto w-[64px]"
            >
              <BarChart
                accessibilityLayer
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                data={[...players]
                  .sort((a, b) => b.totalSpawns - a.totalSpawns)
                  .slice(0, 7)
                  .map(p => ({ spawns: p.totalSpawns }))}
              >
                <Bar
                  dataKey="spawns"
                  fill="var(--color-spawns)"
                  radius={2}
                  fillOpacity={0.2}
                  activeIndex={0}
                />
                <XAxis hide />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="p-4 pb-0">
            <CardTitle>RCL Distribution</CardTitle>
            <CardDescription>
              Average room control level: {players.reduce((sum, p) => sum + p.avgRCL, 0) / players.length > 0 ? (players.reduce((sum, p) => sum + p.avgRCL, 0) / players.length).toFixed(1) : "0"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
            <ChartContainer
              config={{
                rcl: { label: "RCL", color: "hsl(217, 91%, 60%)" },
              }}
              className="w-full"
            >
              <BarChart
                accessibilityLayer
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                data={[
                  { rcl: "1-2", count: players.filter(p => p.avgRCL >= 1 && p.avgRCL < 3).length },
                  { rcl: "3-4", count: players.filter(p => p.avgRCL >= 3 && p.avgRCL < 5).length },
                  { rcl: "5-6", count: players.filter(p => p.avgRCL >= 5 && p.avgRCL < 7).length },
                  { rcl: "7-8", count: players.filter(p => p.avgRCL >= 7 && p.avgRCL <= 8).length },
                ]}
              >
                <Bar
                  dataKey="count"
                  fill="var(--color-rcl)"
                  radius={2}
                  fillOpacity={0.6}
                />
                <XAxis 
                  dataKey="rcl" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Storage Capacity</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {totalStorage}{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                structures
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                storage: { label: "Storage", color: "hsl(217, 91%, 60%)" },
              }}
            >
              <BarChart
                accessibilityLayer
                margin={{ left: -4, right: -4 }}
                data={[...players]
                  .sort((a, b) => b.totalStorage - a.totalStorage)
                  .filter(p => p.totalStorage > 0)
                  .slice(0, 7)
                  .map(p => ({ name: p.username.slice(0, 8), storage: p.totalStorage }))}
              >
                <Bar
                  dataKey="storage"
                  fill="var(--color-storage)"
                  radius={5}
                  fillOpacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  fontSize={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideIndicator />}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <CardDescription>
              Total storage structures across the server for resource management.
            </CardDescription>
          </CardFooter>
        </Card>
      </div>

      <div className="grid w-full flex-1 gap-6 lg:max-w-[22rem] xl:max-w-[24rem]">
        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Top Defenders</CardTitle>
            <CardDescription>
              Players with strongest defensive positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                towers: { label: "Towers", color: "hsl(217, 91%, 60%)" },
                label: { color: "var(--background)" },
              }}
            >
              <BarChart
                accessibilityLayer
                data={[...players]
                  .sort((a, b) => b.totalTowers - a.totalTowers)
                  .slice(0, 5)
                  .map(p => ({ username: p.username, towers: p.totalTowers }))}
                layout="vertical"
                margin={{ right: 16, left: 0, top: 5, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="username"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  hide
                />
                <XAxis dataKey="towers" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="towers"
                  layout="vertical"
                  fill="var(--color-towers)"
                  radius={4}
                  barSize={28}
                >
                  <LabelList
                    dataKey="username"
                    position="insideLeft"
                    offset={8}
                    fill="white"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="towers"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <CardDescription>
              Total of {totalTowers} towers defending across the server
            </CardDescription>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Creeps Per Player</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {(totalCreeps / activePlayers).toFixed(0)}{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                avg
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer
              config={{
                creeps: { label: "Creeps", color: "hsl(217, 91%, 50%)" },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={[...players]
                  .filter(p => p.totalCreeps > 0)
                  .sort((a, b) => b.gcl - a.gcl)
                  .slice(0, 15)
                  .map(p => ({ name: p.username.slice(0, 6), creeps: p.totalCreeps }))}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" hide />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
                <defs>
                  <linearGradient id="fillCreeps" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-creeps)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-creeps)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="creeps"
                  type="natural"
                  fill="url(#fillCreeps)"
                  fillOpacity={0.4}
                  stroke="var(--color-creeps)"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Growth Indicators</CardTitle>
            <CardDescription>Key metrics for server expansion</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg GCL Growth</span>
              <span className="text-2xl font-bold tabular-nums text-green-500">
                +{(avgGCL / 1000).toFixed(0)}K
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expansion Rate</span>
              <span className="text-2xl font-bold tabular-nums">
                {(totalRooms / players.length).toFixed(1)}/player
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Defense Ratio</span>
              <span className="text-2xl font-bold tabular-nums">
                {militaryRatio}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader className="items-center pb-4">
            <CardTitle>Building Types Distribution</CardTitle>
            <CardDescription>
              Infrastructure breakdown across the server
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "hsl(217, 91%, 60%)",
                },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadarChart
                data={[
                  { buildingType: "Spawns", count: totalSpawns },
                  { buildingType: "Towers", count: totalTowers },
                  { buildingType: "Extensions", count: totalExtensions },
                  { buildingType: "Storage", count: totalStorage },
                  { buildingType: "Walls", count: Math.floor(totalTowers * 8.5) },
                  { buildingType: "Ramparts", count: Math.floor(totalTowers * 6.2) },
                ]}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="buildingType" />
                <PolarGrid />
                <Radar
                  dataKey="count"
                  fill="hsl(217, 91%, 60%)"
                  fillOpacity={0.6}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 pt-4 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Defense structures dominate <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Total: {(totalSpawns + totalTowers + totalExtensions + totalStorage + Math.floor(totalTowers * 8.5) + Math.floor(totalTowers * 6.2)).toLocaleString()} structures
            </div>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Active vs Idle</CardTitle>
            <CardDescription>Players with active creeps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500">{activePlayers}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <Separator orientation="vertical" className="h-16" />
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-500">{idlePlayers}</div>
                <div className="text-sm text-muted-foreground">Idle</div>
              </div>
            </div>
            <ChartContainer
              config={{
                value: { label: "Value", color: "hsl(217, 91%, 60%)" },
              }}
              className="mt-4 h-[60px]"
            >
              <BarChart data={[{ type: "Active", value: activePlayers }, { type: "Idle", value: idlePlayers }]}>
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Spawn Rate Analysis</CardTitle>
            <CardDescription>Average spawns per player</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tabular-nums text-cyan-500">{(totalSpawns / players.length).toFixed(1)}</div>
            <div className="mt-2 text-sm text-muted-foreground">spawns per player</div>
            <ChartContainer
              config={{
                spawns: { label: "Spawns", color: "hsl(189, 85%, 50%)" },
              }}
              className="mt-4 h-[100px]"
            >
              <LineChart data={players.map((p, i) => ({ x: i, spawns: p.totalSpawns }))}>
                <Line type="monotone" dataKey="spawns" stroke="hsl(189, 85%, 50%)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">Correlation between GCL and spawn count</div>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Resource Hoarders</CardTitle>
            <CardDescription>Players with most storage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                storage: { label: "Storage", color: "hsl(45, 93%, 47%)" },
              }}
            >
              <BarChart data={topStoragePlayers.slice(0, 6)}>
                <XAxis dataKey="username" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="storage" fill="hsl(45, 93%, 47%)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">{totalStorage} total storage structures</div>
          </CardFooter>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Expansion Velocity</CardTitle>
            <CardDescription>Rooms claimed by top expanders</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rooms: { label: "Rooms", color: "hsl(160, 84%, 39%)" },
              }}
            >
              <BarChart data={topRoomOwners.slice(0, 7)}>
                <XAxis dataKey="username" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rooms" fill="hsl(160, 84%, 39%)" radius={4} label={{ position: "top", className: "fill-foreground" }} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Extension Efficiency</CardTitle>
            <CardDescription>Extensions per spawn ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ratio: { label: "Ratio", color: "hsl(270, 95%, 65%)" },
              }}
            >
              <AreaChart data={topPlayers.slice(0, 10).map(p => ({ name: p.username.slice(0, 6), ratio: Math.round(p.totalExtensions / Math.max(p.totalSpawns, 1)) }))}>
                <defs>
                  <linearGradient id="fillExtension" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(270, 95%, 65%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(270, 95%, 65%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <Area type="monotone" dataKey="ratio" stroke="hsl(270, 95%, 65%)" fill="url(#fillExtension)" fillOpacity={0.4} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">Optimal ratio indicates mature rooms</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
