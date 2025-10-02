"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface RoomObject {
  _id: string
  type: string
  x: number
  y: number
  user?: string
  energy?: number
  energyCapacity?: number
  hits?: number
  hitsMax?: number
}

interface RoomVisualProps {
  objects: RoomObject[]
  terrain?: string
  selectedUserId?: string
}

const CELL_SIZE = 10
const ROOM_SIZE = 50

const STRUCTURE_COLORS: Record<string, string> = {
  spawn: '#ff6b6b',
  extension: '#ffd43b',
  tower: '#fa5252',
  storage: '#51cf66',
  container: '#94d82d',
  link: '#339af0',
  lab: '#cc5de8',
  controller: '#4c6ef5',
  road: '#868e96',
  wall: '#343a40',
  rampart: '#37b24d',
  constructedWall: '#495057',
  terminal: '#20c997',
  observer: '#15aabf',
  powerSpawn: '#e64980',
  extractor: '#fd7e14',
  nuker: '#f03e3e',
  factory: '#ae3ec9'
}

const TERRAIN_COLORS = {
  plain: '#2b2b2b',
  wall: '#111111',
  swamp: '#1a3a1a'
}

export function RoomVisual({ objects, terrain, selectedUserId }: RoomVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (terrain) {
      for (let y = 0; y < ROOM_SIZE; y++) {
        for (let x = 0; x < ROOM_SIZE; x++) {
          const index = y * ROOM_SIZE + x
          const terrainCode = parseInt(terrain[index])
          
          let color = TERRAIN_COLORS.plain
          if (terrainCode & 1) {
            color = TERRAIN_COLORS.wall
          } else if (terrainCode & 2) {
            color = TERRAIN_COLORS.swamp
          }
          
          ctx.fillStyle = color
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }
    } else {
      ctx.fillStyle = TERRAIN_COLORS.plain
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= ROOM_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, canvas.height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(canvas.width, i * CELL_SIZE)
      ctx.stroke()
    }

    objects.forEach(obj => {
      const isOwned = obj.user === selectedUserId || !obj.user
      const color = STRUCTURE_COLORS[obj.type] || '#adb5bd'
      
      ctx.fillStyle = isOwned ? color : color + '80'
      
      if (obj.type === 'creep') {
        ctx.beginPath()
        ctx.arc(
          obj.x * CELL_SIZE + CELL_SIZE / 2,
          obj.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 3,
          0,
          2 * Math.PI
        )
        ctx.fill()
      } else if (obj.type === 'controller') {
        ctx.fillRect(
          obj.x * CELL_SIZE + CELL_SIZE / 4,
          obj.y * CELL_SIZE + CELL_SIZE / 4,
          CELL_SIZE / 2,
          CELL_SIZE / 2
        )
      } else {
        ctx.fillRect(
          obj.x * CELL_SIZE + 1,
          obj.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        )
      }

      if (obj.energy && obj.energyCapacity) {
        const energyPercent = obj.energy / obj.energyCapacity
        ctx.fillStyle = '#ffd43b'
        ctx.fillRect(
          obj.x * CELL_SIZE + 1,
          obj.y * CELL_SIZE + CELL_SIZE - 2,
          (CELL_SIZE - 2) * energyPercent,
          1
        )
      }

      if (obj.hits && obj.hitsMax && obj.hits < obj.hitsMax) {
        const hitsPercent = obj.hits / obj.hitsMax
        ctx.fillStyle = hitsPercent > 0.5 ? '#51cf66' : '#ff6b6b'
        ctx.fillRect(
          obj.x * CELL_SIZE + 1,
          obj.y * CELL_SIZE + 1,
          (CELL_SIZE - 2) * hitsPercent,
          1
        )
      }
    })
  }, [objects, terrain, selectedUserId])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-auto">
          <canvas
            ref={canvasRef}
            width={ROOM_SIZE * CELL_SIZE}
            height={ROOM_SIZE * CELL_SIZE}
            className="border border-border"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.spawn }} />
            <span>Spawn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.extension }} />
            <span>Extension</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.tower }} />
            <span>Tower</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.storage }} />
            <span>Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.controller }} />
            <span>Controller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#adb5bd' }} />
            <span>Creep</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
