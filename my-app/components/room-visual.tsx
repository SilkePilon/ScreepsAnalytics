"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface RoomObject {
  _id: string
  type: string
  x: number
  y: number
  user?: string
  name?: string
  energy?: number
  energyCapacity?: number
  store?: Record<string, number>
  storeCapacity?: number
  storeCapacityResource?: Record<string, number>
  hits?: number
  hitsMax?: number
  level?: number
  progress?: number
  progressTotal?: number
}

interface RoomVisualProps {
  objects: RoomObject[]
  terrain?: string
  selectedUserId?: string
  roomStats?: {
    totals?: Record<string, number>
  }
}

interface TooltipData {
  x: number
  y: number
  content: string[]
  screenX: number
  screenY: number
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

export function calculateControllerProgress(objects: RoomObject[]) {
  const controller = objects.find(obj => obj.type === 'controller')
  
  if (!controller || !controller.progress || !controller.level) {
    return null
  }

  const level = controller.level
  if (level >= 8) return null
  
  const progress = controller.progress
  let progressTotal = controller.progressTotal
  
  if (!progressTotal) {
    const CONTROLLER_LEVELS = [
      20, 4500, 13500, 40500, 121500, 364500, 1093500
    ]
    progressTotal = CONTROLLER_LEVELS[level - 1]
  }
  
  if (!progressTotal || progress > progressTotal * 2) {
    return null
  }

  const percentage = (progress / progressTotal) * 100
  const remaining = progressTotal - progress

  const averageEnergyPerTick = 15
  const ticksRemaining = remaining / averageEnergyPerTick
  const hoursRemaining = (ticksRemaining * 3) / 3600

  return {
    level: level,
    progress,
    total: progressTotal,
    percentage,
    remaining,
    eta: hoursRemaining
  }
}

export function RoomVisual({ objects, terrain, selectedUserId, roomStats }: RoomVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [highlightEnergy, setHighlightEnergy] = useState(false)
  const [highlightDamaged, setHighlightDamaged] = useState(false)
  const [highlightMyStructures, setHighlightMyStructures] = useState(false)

  const getObjectsAtPosition = useCallback((x: number, y: number) => {
    return objects.filter(obj => obj.x === x && obj.y === y)
  }, [objects])

  const getTerrainType = useCallback((x: number, y: number) => {
    if (!terrain) return 'plain'
    const index = y * ROOM_SIZE + x
    const terrainCode = parseInt(terrain[index])
    if (terrainCode & 1) return 'wall'
    if (terrainCode & 2) return 'swamp'
    return 'plain'
  }, [terrain])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    const cellX = Math.floor(canvasX / CELL_SIZE)
    const cellY = Math.floor(canvasY / CELL_SIZE)

    if (cellX >= 0 && cellX < ROOM_SIZE && cellY >= 0 && cellY < ROOM_SIZE) {
      setHoveredCell({ x: cellX, y: cellY })

      const objectsAtPos = getObjectsAtPosition(cellX, cellY)
      const terrainType = getTerrainType(cellX, cellY)
      const tooltipContent: string[] = []

      tooltipContent.push(`Position: (${cellX}, ${cellY})`)
      tooltipContent.push(`Terrain: ${terrainType}`)

      if (objectsAtPos.length > 0) {
        objectsAtPos.forEach(obj => {
          tooltipContent.push(`---`)
          tooltipContent.push(`Type: ${obj.type}`)
          if (obj.name) tooltipContent.push(`Name: ${obj.name}`)
          
          if (obj.store?.energy !== undefined) {
            const capacity = obj.storeCapacityResource?.energy || obj.storeCapacity || 0
            tooltipContent.push(`Energy: ${obj.store.energy.toLocaleString()} / ${capacity.toLocaleString()}`)
          } else if (obj.energy !== undefined && obj.energyCapacity !== undefined) {
            tooltipContent.push(`Energy: ${obj.energy.toLocaleString()} / ${obj.energyCapacity.toLocaleString()}`)
          }

          if (obj.store && Object.keys(obj.store).length > 0) {
            const otherResources = Object.entries(obj.store).filter(([key]) => key !== 'energy')
            if (otherResources.length > 0) {
              tooltipContent.push(`Resources:`)
              otherResources.forEach(([resource, amount]) => {
                tooltipContent.push(`  ${resource}: ${amount.toLocaleString()}`)
              })
            }
          }

          if (obj.hits !== undefined && obj.hitsMax !== undefined) {
            tooltipContent.push(`Hits: ${obj.hits.toLocaleString()} / ${obj.hitsMax.toLocaleString()}`)
          }
        })
      }

      setTooltip({
        x: cellX,
        y: cellY,
        content: tooltipContent,
        screenX: e.clientX,
        screenY: e.clientY
      })
    } else {
      setHoveredCell(null)
      setTooltip(null)
    }
  }, [getObjectsAtPosition, getTerrainType])

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
    setTooltip(null)
  }, [])

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
      
      const hasEnergy = (obj.store?.energy && obj.store.energy > 0) || (obj.energy && obj.energy > 0)
      const isDamaged = obj.hits && obj.hitsMax && obj.hits < obj.hitsMax
      
      let shouldHighlight = false
      if (highlightEnergy && hasEnergy) shouldHighlight = true
      if (highlightDamaged && isDamaged) shouldHighlight = true
      if (highlightMyStructures && isOwned) shouldHighlight = true
      
      ctx.fillStyle = shouldHighlight ? color : (isOwned ? color : color + '80')
      
      if (shouldHighlight) {
        ctx.shadowColor = color
        ctx.shadowBlur = 10
      } else {
        ctx.shadowBlur = 0
      }
      
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
      } else if (obj.store?.energy !== undefined) {
        const capacity = obj.storeCapacityResource?.energy || obj.storeCapacity || 0
        if (capacity > 0) {
          const energyPercent = obj.store.energy / capacity
          ctx.fillStyle = '#ffd43b'
          ctx.fillRect(
            obj.x * CELL_SIZE + 1,
            obj.y * CELL_SIZE + CELL_SIZE - 2,
            (CELL_SIZE - 2) * energyPercent,
            1
          )
        }
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
      
      ctx.shadowBlur = 0
    })

    if (hoveredCell) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(
        hoveredCell.x * CELL_SIZE,
        hoveredCell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      )
    }
  }, [objects, terrain, selectedUserId, hoveredCell, highlightEnergy, highlightDamaged, highlightMyStructures])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
          <div className="overflow-auto relative w-full md:w-auto flex justify-center">
            <canvas
              ref={canvasRef}
              width={ROOM_SIZE * CELL_SIZE}
              height={ROOM_SIZE * CELL_SIZE}
              className="border border-border cursor-crosshair max-w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {tooltip && (
              <div
                className="fixed z-50 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border text-sm pointer-events-none"
                style={{
                  left: `${tooltip.screenX + 15}px`,
                  top: `${tooltip.screenY + 15}px`,
                  maxWidth: '300px'
                }}
              >
                {tooltip.content.map((line, idx) => (
                  <div key={idx} className={line === '---' ? 'border-t border-border my-1' : ''}>
                    {line !== '---' && line}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-xs min-w-full md:min-w-[100px] flex-wrap md:flex-nowrap justify-center md:justify-start">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.spawn }} />
              <span>Spawn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.extension }} />
              <span>Extension</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.tower }} />
              <span>Tower</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.storage }} />
              <span>Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STRUCTURE_COLORS.controller }} />
              <span>Controller</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#adb5bd' }} />
              <span>Creep</span>
            </div>
            
            <div className="border-t md:border-t border-border my-2 w-full md:w-auto" />
            
            <div className="flex flex-row md:flex-col gap-4 md:gap-2 flex-wrap md:flex-nowrap justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="highlight-energy"
                  checked={highlightEnergy}
                  onCheckedChange={(checked) => setHighlightEnergy(checked as boolean)}
                />
                <Label htmlFor="highlight-energy" className="text-xs cursor-pointer">
                  Energy
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="highlight-damaged"
                  checked={highlightDamaged}
                  onCheckedChange={(checked) => setHighlightDamaged(checked as boolean)}
                />
                <Label htmlFor="highlight-damaged" className="text-xs cursor-pointer">
                  Damaged
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="highlight-mine"
                  checked={highlightMyStructures}
                  onCheckedChange={(checked) => setHighlightMyStructures(checked as boolean)}
                />
                <Label htmlFor="highlight-mine" className="text-xs cursor-pointer">
                  My Structures
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
