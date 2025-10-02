"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserStats } from "@/lib/screeps-api"
import {
  IconUsers,
  IconHome,
  IconSword,
  IconBolt,
  IconBox,
  IconBuilding,
  IconTrendingUp,
  IconShield,
} from "@tabler/icons-react"

interface PlayerDetailsDialogProps {
  player: UserStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailsDialog({
  player,
  open,
  onOpenChange,
}: PlayerDetailsDialogProps) {
  if (!player) return null

  const stats = [
    {
      icon: IconHome,
      label: "Rooms Controlled",
      value: player.rooms,
      color: "text-blue-500",
    },
    {
      icon: IconUsers,
      label: "Total Creeps",
      value: player.totalCreeps,
      color: "text-green-500",
    },
    {
      icon: IconBolt,
      label: "Spawns",
      value: player.totalSpawns,
      color: "text-yellow-500",
    },
    {
      icon: IconSword,
      label: "Towers",
      value: player.totalTowers,
      color: "text-red-500",
    },
    {
      icon: IconBuilding,
      label: "Extensions",
      value: player.totalExtensions,
      color: "text-purple-500",
    },
    {
      icon: IconBox,
      label: "Storage",
      value: player.totalStorage,
      color: "text-orange-500",
    },
    {
      icon: IconTrendingUp,
      label: "Average RCL",
      value: player.avgRCL.toFixed(1),
      color: "text-cyan-500",
    },
  ]

  const avgCreepsPerRoom = player.rooms > 0 ? (player.totalCreeps / player.rooms).toFixed(1) : "0"
  const avgSpawnsPerRoom = player.rooms > 0 ? (player.totalSpawns / player.rooms).toFixed(1) : "0"
  const avgExtensionsPerSpawn = player.totalSpawns > 0 ? (player.totalExtensions / player.totalSpawns).toFixed(1) : "0"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{player.username}</DialogTitle>
          <DialogDescription>
            Detailed statistics and information
          </DialogDescription>
        </DialogHeader>

          <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Global Control Level</div>
              <div className="text-3xl font-bold mt-1">{player.gcl.toLocaleString()}</div>
              <Badge variant="secondary" className="mt-2">
                {(player.gcl / 1000).toFixed(1)}K GCL
              </Badge>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Average RCL</div>
              <div className="text-3xl font-bold mt-1">{player.avgRCL.toFixed(1)}</div>
              <Badge variant="outline" className="mt-2">
                Room Level
              </Badge>
            </div>
          </div>          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IconShield className="size-5" />
              Infrastructure Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                  >
                    <Icon className={`size-8 ${stat.color}`} />
                    <div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IconTrendingUp className="size-5" />
              Efficiency Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Creeps per Room</span>
                <span className="text-2xl font-bold">{avgCreepsPerRoom}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Spawns per Room</span>
                <span className="text-2xl font-bold">{avgSpawnsPerRoom}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Extensions per Spawn</span>
                <span className="text-2xl font-bold">{avgExtensionsPerSpawn}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Military Rating</span>
                <span className="text-2xl font-bold">
                  {player.totalTowers * 10 + player.rooms * 5}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
