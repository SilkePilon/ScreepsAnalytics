import { IconTrendingUp, IconUsers, IconHome, IconBolt, IconTrophy } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserStats } from "@/lib/screeps-api"

interface SectionCardsProps {
  players: UserStats[]
  loading: boolean
}

export function SectionCards({ players, loading }: SectionCardsProps) {
  const totalPlayers = players.length
  const activePlayers = players.filter(p => p.gcl > 0).length
  const totalRooms = players.reduce((sum, p) => sum + p.rooms, 0)
  const totalGCL = players.reduce((sum, p) => sum + p.gcl, 0)
  const avgGCL = totalPlayers > 0 ? (totalGCL / totalPlayers).toFixed(1) : "0"

  if (loading && players.length === 0) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Players</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPlayers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              {activePlayers} active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Server population <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Players registered on this server
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rooms</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalRooms}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconHome className="size-4" />
              Claimed
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Territory control <IconHome className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Rooms controlled by players
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average GCL</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {avgGCL}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBolt className="size-4" />
              Level
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Player progression <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Average Global Control Level</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top Player GCL</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {players.length > 0 ? players[0].gcl.toLocaleString() : "0"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrophy className="size-4" />
              Leader
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Highest ranked player <IconTrophy className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {players.length > 0 ? players[0].username : "No data"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
