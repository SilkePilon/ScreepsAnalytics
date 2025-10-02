"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoomVisual, calculateControllerProgress } from "@/components/room-visual"
import { getServerSettings } from "@/lib/screeps-api"
import { 
  IconHome, 
  IconRefresh, 
  IconSearch, 
  IconUser, 
  IconBolt,
  IconShield,
  IconFlame,
  IconBuildingSkyscraper,
  IconBox,
  IconDroplet,
  IconDiamond,
  IconCpu,
  IconFlag,
  IconTarget,
  IconMap
} from "@tabler/icons-react"
import { toast } from "sonner"

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
  body?: Array<{ type: string; hits: number }>
}

interface RoomData {
  objects: RoomObject[]
  owner?: { username: string; _id: string }
}

interface RoomStats {
  totals: Record<string, number>
}

interface TerrainData {
  terrain: string
}

export function RoomControl() {
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [roomSearch, setRoomSearch] = useState<string>("")
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null)
  const [roomTerrain, setRoomTerrain] = useState<string>("")
  const [myRooms, setMyRooms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    const loadMyRooms = async () => {
      try {
        const settings = getServerSettings()
        const userResponse = await fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'test-connection',
            settings
          })
        })
        
        if (!userResponse.ok) return
        
        const userData = await userResponse.json()
        if (userData.data?._id) {
          const roomsResponse = await fetch('/api/screeps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get-user-rooms',
              settings,
              params: { userId: userData.data._id }
            })
          })
          
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json()
            setMyRooms(roomsData.data?.rooms || [])
          }
        }
      } catch (error) {
        console.error('Failed to load user rooms:', error)
      }
    }
    
    loadMyRooms()
  }, [])

  const loadRoomData = async (roomName: string) => {
    if (!roomName.trim()) return

    setLoading(true)
    try {
      const settings = getServerSettings()
      
      const [objectsResponse, statsResponse, terrainResponse] = await Promise.all([
        fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get-room-objects',
            settings,
            params: { room: roomName }
          })
        }),
        fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get-room-stats',
            settings,
            params: { room: roomName }
          })
        }),
        fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get-room-terrain',
            settings,
            params: { room: roomName }
          })
        })
      ])

      if (!objectsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load room data')
      }

      const objectsData = await objectsResponse.json()
      const statsData = await statsResponse.json()
      const terrainData = await terrainResponse.json()

      console.log('Room objects data:', objectsData.data)
      console.log('Sample spawn:', objectsData.data?.objects?.find((o: RoomObject) => o.type === 'spawn'))
      console.log('Sample extension:', objectsData.data?.objects?.find((o: RoomObject) => o.type === 'extension'))
      console.log('Sample controller:', objectsData.data?.objects?.find((o: RoomObject) => o.type === 'controller'))
      console.log('Room stats data:', statsData.data)

      setRoomData(objectsData.data)
      setRoomStats(statsData.data)
      setRoomTerrain(terrainData.data?.terrain?.[0]?.terrain || "")
      toast.success(`Room ${roomName} loaded successfully`)
    } catch (error) {
      console.error('Error loading room:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load room')
      setRoomData(null)
      setRoomStats(null)
      setRoomTerrain("")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!autoRefresh || !selectedRoom) return

    const interval = setInterval(() => {
      loadRoomData(selectedRoom)
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, selectedRoom])

  const handleLoadRoom = () => {
    setSelectedRoom(roomSearch)
    loadRoomData(roomSearch)
  }

  const handleRefresh = () => {
    loadRoomData(selectedRoom)
  }

  const getObjectsByType = (type: string) => {
    if (!roomData) return []
    return roomData.objects.filter(obj => obj.type === type)
  }

  const getCreeps = () => getObjectsByType('creep')
  const getMyCreeps = () => {
    if (!roomData) return []
    const controller = getController()
    const roomOwner = controller?.user
    return getCreeps().filter(creep => creep.user === roomOwner)
  }
  const getHostileCreeps = () => {
    if (!roomData) return []
    const controller = getController()
    const roomOwner = controller?.user
    return getCreeps().filter(creep => creep.user !== roomOwner)
  }
  const getSpawns = () => getObjectsByType('spawn')
  const getTowers = () => getObjectsByType('tower')
  const getExtensions = () => getObjectsByType('extension')
  const getStorages = () => getObjectsByType('storage')
  const getContainers = () => getObjectsByType('container')
  const getLinks = () => getObjectsByType('link')
  const getLabs = () => getObjectsByType('lab')
  const getController = () => getObjectsByType('controller')[0]

  const calculateTotalEnergy = () => {
    if (!roomData) return { available: 0, capacity: 0 }
    const roomSpawns = getSpawns()
    const roomExtensions = getExtensions()
    
    let available = 0
    let capacity = 0

    const energyStructures = [...roomSpawns, ...roomExtensions]
    energyStructures.forEach(obj => {
      if (obj.store && obj.store.energy !== undefined) {
        available += obj.store.energy
        if (obj.storeCapacityResource && obj.storeCapacityResource.energy !== undefined) {
          capacity += obj.storeCapacityResource.energy
        } else if (obj.storeCapacity !== undefined) {
          capacity += obj.storeCapacity
        }
      } else if (obj.energy !== undefined) {
        available += obj.energy
        capacity += obj.energyCapacity || 0
      }
    })

    return { available, capacity }
  }

  const getTotalResources = () => {
    if (!roomData) return {}
    const storages = [...getStorages(), ...getContainers()]
    const resources: Record<string, number> = {}

    storages.forEach(storage => {
      if (storage.store) {
        Object.entries(storage.store).forEach(([resource, amount]) => {
          resources[resource] = (resources[resource] || 0) + amount
        })
      }
    })

    return resources
  }

  const controller = getController()
  const energy = calculateTotalEnergy()
  const creeps = getCreeps()
  const resources = getTotalResources()
  const isMyRoom = myRooms.includes(selectedRoom)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Room Control</h2>
        <p className="text-muted-foreground">{isMyRoom ? 'Monitor and control your rooms' : 'View room information'}</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="room-search" className="sr-only">Search Room</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="room-search"
              placeholder="Enter room name (e.g., E0N0)"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadRoom()}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleLoadRoom} disabled={loading || !roomSearch}>
          <IconHome className="size-4" />
          Load Room
        </Button>
      </div>

      {myRooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Rooms</CardTitle>
            <CardDescription>Quick access to your controlled rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {myRooms.map((room) => (
                <Button
                  key={room}
                  variant={selectedRoom === room ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedRoom(room)
                    setRoomSearch(room)
                    loadRoomData(room)
                  }}
                >
                  <IconHome className="size-3 mr-1" />
                  {room}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedRoom ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconHome className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Enter a room name to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="creeps">Creeps ({creeps.length})</TabsTrigger>
            <TabsTrigger value="structures">Structures</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconHome className="size-5" />
                    {selectedRoom}
                    {roomData?.owner && (
                      <Badge variant="outline">
                        <IconUser className="size-3 mr-1" />
                        {roomData.owner.username}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      {autoRefresh ? 'Auto' : 'Manual'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                      <IconRefresh className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
                <CardDescription>{isMyRoom ? 'Room information and statistics' : 'Viewing room information'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <IconTarget className="size-4" />
                      Controller Level
                    </p>
                    <p className="text-2xl font-bold">
                      {controller ? `RCL ${controller.level || 0}` : 'N/A'}
                    </p>
                    {controller && controller.progress && controller.progressTotal && (
                      <p className="text-xs text-muted-foreground">
                        {((controller.progress / controller.progressTotal) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <IconBolt className="size-4" />
                      Energy Available
                    </p>
                    <p className="text-2xl font-bold">{energy.available.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {energy.capacity > 0 ? ((energy.available / energy.capacity) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <IconBox className="size-4" />
                      Energy Capacity
                    </p>
                    <p className="text-2xl font-bold">{energy.capacity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <IconUser className="size-4" />
                      Creeps Count
                    </p>
                    <p className="text-2xl font-bold">{creeps.length}</p>
                  </div>
                </div>

                {roomStats && (
                  <div>
                    <h3 className="font-semibold mb-3">Room Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(roomStats.totals || {}).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Structure Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <IconBuildingSkyscraper className="size-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Spawns</p>
                        <p className="font-semibold">{getSpawns().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBolt className="size-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Extensions</p>
                        <p className="font-semibold">{getExtensions().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconFlame className="size-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Towers</p>
                        <p className="font-semibold">{getTowers().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBox className="size-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Storage</p>
                        <p className="font-semibold">{getStorages().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconDroplet className="size-5 text-cyan-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Links</p>
                        <p className="font-semibold">{getLinks().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconDiamond className="size-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Labs</p>
                        <p className="font-semibold">{getLabs().length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBox className="size-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Containers</p>
                        <p className="font-semibold">{getContainers().length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {roomData && (() => {
                  const controllerProgress = calculateControllerProgress(roomData.objects)
                  return controllerProgress ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Room Controller Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium">
                              Room Controller Level {controllerProgress.level}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {controllerProgress.progress.toLocaleString()} / {controllerProgress.total.toLocaleString()} ({controllerProgress.percentage.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">ETA to Level {controllerProgress.level + 1}</p>
                            <p className="text-sm font-medium">
                              {controllerProgress.eta < 1 
                                ? `${Math.round(controllerProgress.eta * 60)} min`
                                : controllerProgress.eta < 24
                                ? `${controllerProgress.eta.toFixed(1)} hrs`
                                : `${(controllerProgress.eta / 24).toFixed(1)} days`
                              }
                            </p>
                          </div>
                        </div>
                        <Progress value={controllerProgress.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Remaining: {controllerProgress.remaining.toLocaleString()} energy
                        </p>
                      </CardContent>
                    </Card>
                  ) : null
                })()}

                {roomData && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <IconMap className="size-4" />
                      Room Visual Map
                    </h3>
                    <RoomVisual 
                      objects={roomData.objects} 
                      terrain={roomTerrain}
                      selectedUserId={roomData.owner?._id}
                      roomStats={roomStats || undefined}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creeps" className="space-y-4">
            {getHostileCreeps().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-500">Hostile Creeps in {selectedRoom}</CardTitle>
                  <CardDescription>Enemy creeps detected ({getHostileCreeps().length} hostile)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Body Parts</TableHead>
                        <TableHead>Hits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getHostileCreeps().map((creep) => (
                        <TableRow key={creep._id} className="bg-red-50 dark:bg-red-950/20">
                          <TableCell className="font-medium">{creep.name || 'Unnamed'}</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">{creep.user || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">x:{creep.x} y:{creep.y}</Badge>
                          </TableCell>
                          <TableCell>
                            {creep.body ? (
                              <TooltipProvider>
                                <div className="flex gap-1 flex-wrap">
                                  {creep.body.slice(0, 10).map((part, idx) => {
                                    const colors: Record<string, string> = {
                                      work: '#ffe56d',
                                      move: '#a9b7c6',
                                      carry: '#777',
                                      attack: '#f93842',
                                      ranged_attack: '#5d80b2',
                                      heal: '#65fd62',
                                      claim: '#b99cfb',
                                      tough: '#fff'
                                    }
                                    const bgColor = colors[part.type.toLowerCase()] || '#999'
                                    const textColor = ['tough', 'work', 'heal'].includes(part.type.toLowerCase()) ? '#000' : '#fff'
                                    
                                    return (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className="text-xs font-semibold"
                                        style={{ 
                                          backgroundColor: bgColor,
                                          color: textColor,
                                          border: 'none'
                                        }}
                                      >
                                        {part.type.toUpperCase()}
                                      </Badge>
                                    )
                                  })}
                                  {creep.body.length > 10 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs font-semibold cursor-help"
                                          style={{ 
                                            backgroundColor: '#444',
                                            color: '#fff',
                                            border: 'none'
                                          }}
                                        >
                                          +{creep.body.length - 10}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="max-w-md">
                                        <div className="flex gap-1 flex-wrap">
                                          {creep.body.slice(10).map((part, idx) => {
                                            const colors: Record<string, string> = {
                                              work: '#ffe56d',
                                              move: '#a9b7c6',
                                              carry: '#777',
                                              attack: '#f93842',
                                              ranged_attack: '#5d80b2',
                                              heal: '#65fd62',
                                              claim: '#b99cfb',
                                              tough: '#fff'
                                            }
                                            const bgColor = colors[part.type.toLowerCase()] || '#999'
                                            const textColor = ['tough', 'work', 'heal'].includes(part.type.toLowerCase()) ? '#000' : '#fff'
                                            
                                            return (
                                              <Badge 
                                                key={idx} 
                                                variant="secondary" 
                                                className="text-xs font-semibold"
                                                style={{ 
                                                  backgroundColor: bgColor,
                                                  color: textColor,
                                                  border: 'none'
                                                }}
                                              >
                                                {part.type.toUpperCase()}
                                              </Badge>
                                            )
                                          })}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TooltipProvider>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500"
                                  style={{ width: `${creep.hits && creep.hitsMax ? (creep.hits / creep.hitsMax) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {creep.hits?.toLocaleString()}/{creep.hitsMax?.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{isMyRoom ? 'My Creeps in' : 'Creeps in'} {selectedRoom}</CardTitle>
                <CardDescription>{isMyRoom ? 'View and manage your creeps' : 'Creeps in this room'} ({getMyCreeps().length} total)</CardDescription>
              </CardHeader>
              <CardContent>
                {getMyCreeps().length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No creeps found in this room</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Body Parts</TableHead>
                        <TableHead>Hits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getMyCreeps().map((creep) => (
                        <TableRow key={creep._id}>
                          <TableCell className="font-medium">{creep.name || 'Unnamed'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">x:{creep.x} y:{creep.y}</Badge>
                          </TableCell>
                          <TableCell>
                            {creep.body ? (
                              <TooltipProvider>
                                <div className="flex gap-1 flex-wrap">
                                  {creep.body.slice(0, 10).map((part, idx) => {
                                    const colors: Record<string, string> = {
                                      work: '#ffe56d',
                                      move: '#a9b7c6',
                                      carry: '#777',
                                      attack: '#f93842',
                                      ranged_attack: '#5d80b2',
                                      heal: '#65fd62',
                                      claim: '#b99cfb',
                                      tough: '#fff'
                                    }
                                    const bgColor = colors[part.type.toLowerCase()] || '#999'
                                    const textColor = ['tough', 'work', 'heal'].includes(part.type.toLowerCase()) ? '#000' : '#fff'
                                    
                                    return (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className="text-xs font-semibold"
                                        style={{ 
                                          backgroundColor: bgColor,
                                          color: textColor,
                                          border: 'none'
                                        }}
                                      >
                                        {part.type.toUpperCase()}
                                      </Badge>
                                    )
                                  })}
                                  {creep.body.length > 10 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs font-semibold cursor-help"
                                          style={{ 
                                            backgroundColor: '#444',
                                            color: '#fff',
                                            border: 'none'
                                          }}
                                        >
                                          +{creep.body.length - 10}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="max-w-md">
                                        <div className="flex gap-1 flex-wrap">
                                          {creep.body.slice(10).map((part, idx) => {
                                            const colors: Record<string, string> = {
                                              work: '#ffe56d',
                                              move: '#a9b7c6',
                                              carry: '#777',
                                              attack: '#f93842',
                                              ranged_attack: '#5d80b2',
                                              heal: '#65fd62',
                                              claim: '#b99cfb',
                                              tough: '#fff'
                                            }
                                            const bgColor = colors[part.type.toLowerCase()] || '#999'
                                            const textColor = ['tough', 'work', 'heal'].includes(part.type.toLowerCase()) ? '#000' : '#fff'
                                            
                                            return (
                                              <Badge 
                                                key={idx} 
                                                variant="secondary" 
                                                className="text-xs font-semibold"
                                                style={{ 
                                                  backgroundColor: bgColor,
                                                  color: textColor,
                                                  border: 'none'
                                                }}
                                              >
                                                {part.type.toUpperCase()}
                                              </Badge>
                                            )
                                          })}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TooltipProvider>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {creep.hits && creep.hitsMax ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500"
                                    style={{ width: `${(creep.hits / creep.hitsMax) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs">{creep.hits}/{creep.hitsMax}</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Structures in {selectedRoom}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSpawns().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <IconBuildingSkyscraper className="size-4" />
                      Spawns ({getSpawns().length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Energy</TableHead>
                          <TableHead>Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSpawns().map((spawn) => (
                          <TableRow key={spawn._id}>
                            <TableCell className="font-medium">{spawn.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">x:{spawn.x} y:{spawn.y}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="text-yellow-500">⚡</span> {spawn.store?.energy !== undefined ? spawn.store.energy : spawn.energy || 0}/{spawn.storeCapacityResource?.energy || spawn.storeCapacity || spawn.energyCapacity || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${spawn.hits && spawn.hitsMax ? (spawn.hits / spawn.hitsMax) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{((spawn.hits && spawn.hitsMax ? (spawn.hits / spawn.hitsMax) * 100 : 0)).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {getTowers().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <IconFlame className="size-4" />
                      Towers ({getTowers().length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Energy</TableHead>
                          <TableHead>Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTowers().map((tower) => (
                          <TableRow key={tower._id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">x:{tower.x} y:{tower.y}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="text-yellow-500">⚡</span> {tower.store?.energy !== undefined ? tower.store.energy : tower.energy || 0}/{tower.storeCapacityResource?.energy || tower.storeCapacity || tower.energyCapacity || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${tower.hits && tower.hitsMax ? (tower.hits / tower.hitsMax) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{((tower.hits && tower.hitsMax ? (tower.hits / tower.hitsMax) * 100 : 0)).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {getExtensions().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <IconBolt className="size-4" />
                      Extensions ({getExtensions().length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Energy</TableHead>
                          <TableHead>Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getExtensions().map((ext) => (
                          <TableRow key={ext._id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">x:{ext.x} y:{ext.y}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="text-yellow-500">⚡</span> {ext.store?.energy !== undefined ? ext.store.energy : ext.energy || 0}/{ext.storeCapacityResource?.energy || ext.storeCapacity || ext.energyCapacity || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${ext.hits && ext.hitsMax ? (ext.hits / ext.hitsMax) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{((ext.hits && ext.hitsMax ? (ext.hits / ext.hitsMax) * 100 : 0)).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {getStorages().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <IconBox className="size-4" />
                      Storage ({getStorages().length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Resources</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getStorages().map((storage) => (
                          <TableRow key={storage._id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">x:{storage.x} y:{storage.y}</Badge>
                            </TableCell>
                            <TableCell>
                              {storage.store && (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(storage.store).slice(0, 3).map(([resource, amount]) => (
                                    <Badge key={resource} variant="secondary" className="text-xs">
                                      {resource}: {amount.toLocaleString()}
                                    </Badge>
                                  ))}
                                  {Object.keys(storage.store).length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{Object.keys(storage.store).length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {storage.store ? Object.values(storage.store).reduce((a, b) => a + b, 0).toLocaleString() : 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${storage.hits && storage.hitsMax ? (storage.hits / storage.hitsMax) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{((storage.hits && storage.hitsMax ? (storage.hits / storage.hitsMax) * 100 : 0)).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {getContainers().length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <IconBox className="size-4" />
                      Containers ({getContainers().length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Resources</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getContainers().map((container) => (
                          <TableRow key={container._id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">x:{container.x} y:{container.y}</Badge>
                            </TableCell>
                            <TableCell>
                              {container.store && Object.keys(container.store).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(container.store).slice(0, 2).map(([resource, amount]) => (
                                    <Badge key={resource} variant="secondary" className="text-xs">
                                      {resource}: {amount.toLocaleString()}
                                    </Badge>
                                  ))}
                                  {Object.keys(container.store).length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{Object.keys(container.store).length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Empty</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {container.store ? Object.values(container.store).reduce((a, b) => a + b, 0).toLocaleString() : 0} / 2,000
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${container.hits && container.hitsMax ? (container.hits / container.hitsMax) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{((container.hits && container.hitsMax ? (container.hits / container.hitsMax) * 100 : 0)).toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources in {selectedRoom}</CardTitle>
                <CardDescription>{isMyRoom ? 'Monitor resource storage and production' : 'View resource storage in this room'}</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(resources).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No resources found in storage</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(resources).map(([resource, amount]) => (
                      <Card key={resource}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{resource}</p>
                              <p className="text-2xl font-bold">{amount.toLocaleString()}</p>
                            </div>
                            <IconBox className="size-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
