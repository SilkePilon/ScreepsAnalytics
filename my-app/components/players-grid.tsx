"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UserStats } from "@/lib/screeps-api"
import { PlayerDetailsDialog } from "./player-details-dialog"
import { IconUsers, IconHome, IconSword, IconBolt, IconTrophy, IconChartBar } from "@tabler/icons-react"

interface PlayersGridProps {
  players: UserStats[]
}

export function PlayersGrid({ players }: PlayersGridProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<UserStats | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {players.map((player) => (
          <Card
            key={player._id}
            className="w-full max-w-xs shadow-none py-0 gap-0 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedPlayer(player)}
          >
            <CardHeader className="flex flex-row items-center justify-between py-2.5 -mr-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <IconTrophy className="size-5 text-white" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h6 className="text-sm leading-none font-medium truncate max-w-[180px]">{player.username}</h6>
                  <span className="text-xs text-muted-foreground">GCL {(player.gcl / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-y flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{player.rooms}</div>
                  <div className="text-sm text-slate-300">Rooms Controlled</div>
                </div>
              </div>
              <div className="py-4 px-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <IconUsers className="size-4 text-green-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Creeps</div>
                      <div className="text-sm font-semibold">{player.totalCreeps}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBolt className="size-4 text-yellow-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Spawns</div>
                      <div className="text-sm font-semibold">{player.totalSpawns}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSword className="size-4 text-red-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Towers</div>
                      <div className="text-sm font-semibold">{player.totalTowers}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconHome className="size-4 text-blue-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Extensions</div>
                      <div className="text-sm font-semibold">{player.totalExtensions}</div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avg RCL: {player.avgRCL.toFixed(1)}</span>
                  <span>Storage: {player.totalStorage}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex px-2 pb-0 py-2">
              <Button variant="ghost" size="sm" className="grow shrink-0 text-muted-foreground text-xs" onClick={(e) => { e.stopPropagation(); setSelectedPlayer(player); }}>
                <IconChartBar className="size-4" />
                <span>View Details</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlayerDetailsDialog
        player={selectedPlayer}
        open={selectedPlayer !== null}
        onOpenChange={(open: boolean) => !open && setSelectedPlayer(null)}
      />
    </>
  )
}
