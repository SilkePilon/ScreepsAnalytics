"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoomVisual, calculateControllerProgress, getControllerProgressTotal } from "@/components/room-visual"
import { RoomNotificationsDialog } from "@/components/room-notifications-dialog"
import { getServerSettings } from "@/lib/screeps-api"
import { getFavoriteRooms, addFavoriteRoom, removeFavoriteRoom } from "@/lib/supabase"
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
  IconMap,
  IconStar,
  IconStarFilled,
  IconArrowLeft,
  IconBell
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

interface RoomCardData {
  name: string
  rcl: number
  creepCount: number
  owner: string
  energy: { available: number; capacity: number }
  controller: { progress: number; progressTotal: number }
  isFavorite: boolean
  isMyRoom: boolean
}

export function RoomControl() {
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [roomSearch, setRoomSearch] = useState<string>("")
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null)
  const [roomTerrain, setRoomTerrain] = useState<string>("")
  const [myRooms, setMyRooms] = useState<string[]>([])
  const [favoriteRooms, setFavoriteRooms] = useState<string[]>([])
  const [roomCards, setRoomCards] = useState<RoomCardData[]>([])
  const [playerSearchResults, setPlayerSearchResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    const loadMyRooms = async () => {
      try {
        const CACHE_KEY = 'screeps_my_rooms_cache'
        const CACHE_DURATION = 24 * 60 * 60 * 1000
        
        const cachedData = localStorage.getItem(CACHE_KEY)
        if (cachedData) {
          try {
            const { rooms, timestamp } = JSON.parse(cachedData)
            const age = Date.now() - timestamp
            if (age < CACHE_DURATION) {
              setMyRooms(rooms)
              return
            }
          } catch (e) {
            console.error('Failed to parse cached rooms:', e)
          }
        }

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
            const rooms = roomsData.data?.rooms || []
            setMyRooms(rooms)
            
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              rooms,
              timestamp: Date.now()
            }))
          }
        }
      } catch (error) {
        console.error('Failed to load user rooms:', error)
      }
    }
    
    loadMyRooms()
  }, [])

  useEffect(() => {
    const loadFavorites = async () => {
      const serverSettings = getServerSettings()
      if (serverSettings.username && serverSettings.apiUrl) {
        const favorites = await getFavoriteRooms(serverSettings.username, serverSettings.apiUrl)
        setFavoriteRooms(favorites)
      }
    }
    loadFavorites()
  }, [])

  useEffect(() => {
    if (myRooms.length > 0 || favoriteRooms.length > 0) {
      loadRoomCards()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRooms, favoriteRooms])

  const toggleFavorite = async (roomName: string) => {
    const serverSettings = getServerSettings()
    if (!serverSettings.username || !serverSettings.apiUrl) {
      toast.error('Server settings not configured')
      return
    }

    const isCurrentlyFavorite = favoriteRooms.includes(roomName)
    
    const success = isCurrentlyFavorite
      ? await removeFavoriteRoom(serverSettings.username, serverSettings.apiUrl, roomName)
      : await addFavoriteRoom(serverSettings.username, serverSettings.apiUrl, roomName)
    
    if (success) {
      const newFavorites = isCurrentlyFavorite
        ? favoriteRooms.filter(r => r !== roomName)
        : [...favoriteRooms, roomName]
      
      setFavoriteRooms(newFavorites)
      toast.success(isCurrentlyFavorite ? 'Removed from favorites' : 'Added to favorites')
    } else {
      toast.error('Failed to update favorites')
    }
  }

  const loadRoomCards = useCallback(async () => {
    const allRooms = [...new Set([...myRooms, ...favoriteRooms])]
    const cardsData: RoomCardData[] = []

    for (const roomName of allRooms) {
      try {
        const settings = getServerSettings()
        const [objectsResponse, statsResponse] = await Promise.all([
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
          })
        ])

        if (objectsResponse.ok) {
          const data = await objectsResponse.json()
          const objects: RoomObject[] = data.data?.objects || []
          
          const controller = objects.find(obj => obj.type === 'controller')
          const creeps = objects.filter(obj => obj.type === 'creep')
          const spawns = objects.filter(obj => obj.type === 'spawn')
          const extensions = objects.filter(obj => obj.type === 'extension')
          
          let energyAvailable = 0
          let energyCapacity = 0
          
          spawns.forEach(spawn => {
            energyAvailable += spawn.store?.energy || spawn.energy || 0
            energyCapacity += spawn.storeCapacityResource?.energy || spawn.storeCapacity || spawn.energyCapacity || 0
          })
          
          extensions.forEach(ext => {
            energyAvailable += ext.store?.energy || ext.energy || 0
            energyCapacity += ext.storeCapacityResource?.energy || ext.storeCapacity || ext.energyCapacity || 0
          })

          let owner = 'Neutral'
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            owner = statsData.data?.owner?.username || 'Neutral'
          }

          const rcl = controller?.level || 0
          const progress = controller?.progress || 0
          const progressTotal = controller?.progressTotal || getControllerProgressTotal(rcl)

          cardsData.push({
            name: roomName,
            rcl,
            creepCount: creeps.length,
            owner,
            energy: { available: energyAvailable, capacity: energyCapacity },
            controller: { 
              progress, 
              progressTotal 
            },
            isFavorite: favoriteRooms.includes(roomName),
            isMyRoom: myRooms.includes(roomName)
          })
        }
      } catch (error) {
        console.error(`Failed to load card data for ${roomName}:`, error)
      }
    }

    setRoomCards(cardsData)
  }, [myRooms, favoriteRooms])

  const searchPlayerRooms = async (query: string) => {
    if (!query.trim()) {
      setPlayerSearchResults([])
      return
    }

    try {
      const settings = getServerSettings()
      const response = await fetch('/api/screeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find-user',
          settings,
          params: { username: query }
        })
      })

      if (response.ok) {
        const userData = await response.json()
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
            setPlayerSearchResults(roomsData.data?.rooms || [])
          }
        }
      }
    } catch (error) {
      console.error('Failed to search player rooms:', error)
    }
  }

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

      const roomDataWithOwner = {
        ...objectsData.data,
        owner: statsData.data?.owner ? {
          username: statsData.data.owner.username,
          _id: statsData.data.owner._id
        } : undefined
      }

      setRoomData(roomDataWithOwner)
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

  const getResourceBreakdown = () => {
    if (!roomData) return { storage: {}, containers: {}, spawns: {}, extensions: {} }
    
    const breakdown = {
      storage: {} as Record<string, { current: number, max: number }>,
      containers: {} as Record<string, { current: number, max: number }>,
      spawns: {} as Record<string, { current: number, max: number }>,
      extensions: {} as Record<string, { current: number, max: number }>
    }

    getStorages().forEach(storage => {
      if (storage.store) {
        Object.entries(storage.store).forEach(([resource, amount]) => {
          if (!breakdown.storage[resource]) {
            breakdown.storage[resource] = { current: 0, max: 0 }
          }
          breakdown.storage[resource].current += amount
          const capacity = storage.storeCapacity || 1000000
          breakdown.storage[resource].max += capacity
        })
      }
    })

    getContainers().forEach(container => {
      if (container.store) {
        Object.entries(container.store).forEach(([resource, amount]) => {
          if (!breakdown.containers[resource]) {
            breakdown.containers[resource] = { current: 0, max: 0 }
          }
          breakdown.containers[resource].current += amount
          breakdown.containers[resource].max += 2000
        })
      }
    })

    getSpawns().forEach(spawn => {
      const energy = spawn.store?.energy || spawn.energy || 0
      const capacity = spawn.storeCapacityResource?.energy || spawn.storeCapacity || spawn.energyCapacity || 0
      if (!breakdown.spawns.energy) {
        breakdown.spawns.energy = { current: 0, max: 0 }
      }
      breakdown.spawns.energy.current += energy
      breakdown.spawns.energy.max += capacity
    })

    getExtensions().forEach(ext => {
      const energy = ext.store?.energy || ext.energy || 0
      const capacity = ext.storeCapacityResource?.energy || ext.storeCapacity || ext.energyCapacity || 0
      if (!breakdown.extensions.energy) {
        breakdown.extensions.energy = { current: 0, max: 0 }
      }
      breakdown.extensions.energy.current += energy
      breakdown.extensions.energy.max += capacity
    })

    return breakdown
  }

  const controller = getController()
  const energy = calculateTotalEnergy()
  const creeps = getCreeps()
  const isMyRoom = myRooms.includes(selectedRoom)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Room Control</h2>
        <p className="text-muted-foreground">{isMyRoom ? 'Monitor and control your rooms' : 'View room information'}</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Label htmlFor="room-search" className="sr-only">Search Room</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="room-search"
              placeholder="Enter room name (e.g., E0N0) or player name"
              value={roomSearch}
              onChange={(e) => {
                setRoomSearch(e.target.value.toUpperCase())
                searchPlayerRooms(e.target.value)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadRoom()}
              className="pl-10"
            />
          </div>
          {playerSearchResults.length > 0 && (
            <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {playerSearchResults.map((room) => (
                    <Button
                      key={room}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedRoom(room)
                        setRoomSearch(room)
                        loadRoomData(room)
                        setPlayerSearchResults([])
                      }}
                    >
                      <IconHome className="size-3 mr-2" />
                      {room}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Button variant="outline" onClick={handleLoadRoom} disabled={loading || !roomSearch}>
          <IconHome className="size-4 mr-2" />
          Load Room
        </Button>
      </div>

      {!selectedRoom ? (
        <div className="space-y-4">
          {roomCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {roomCards.map((room) => (
                <Card 
                  key={room.name} 
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => {
                    setSelectedRoom(room.name)
                    setRoomSearch(room.name)
                    loadRoomData(room.name)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">{room.rcl}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">{room.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <IconUser className="size-3" />
                            {room.owner}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Badge variant={room.isMyRoom ? "default" : "secondary"} className="text-xs">
                          {room.isMyRoom ? "My Room" : "Favorite"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(room.name)
                          }}
                        >
                          {room.isFavorite ? (
                            <IconStarFilled className="size-4 text-yellow-500" />
                          ) : (
                            <IconStar className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <IconUser className="size-4" />
                          Creeps
                        </span>
                        <span className="font-semibold">{room.creepCount}</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <IconBolt className="size-4" />
                            Energy
                          </span>
                          <span className="font-semibold">
                            {room.energy.capacity > 0 
                              ? `${((room.energy.available / room.energy.capacity) * 100).toFixed(0)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ 
                              width: `${room.energy.capacity > 0 
                                ? Math.min((room.energy.available / room.energy.capacity) * 100, 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>

                      {room.controller.progressTotal > 0 && room.rcl < 8 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <IconTarget className="size-4" />
                              RCL Progress
                            </span>
                            <span className="font-semibold">
                              {((room.controller.progress / room.controller.progressTotal) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{ 
                                width: `${Math.min((room.controller.progress / room.controller.progressTotal) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          {(() => {
                            const remaining = room.controller.progressTotal - room.controller.progress
                            const averageEnergyPerTick = 15
                            const ticksRemaining = remaining / averageEnergyPerTick
                            const hoursRemaining = (ticksRemaining * 3) / 3600
                            
                            if (hoursRemaining < 24) {
                              const displayHours = hoursRemaining % 1 === 0 ? Math.round(hoursRemaining) : hoursRemaining.toFixed(1)
                              return (
                                <p className="text-xs text-muted-foreground">
                                  ETA: {displayHours} hrs
                                </p>
                              )
                            }
                            
                            const daysRemaining = Math.floor(hoursRemaining / 24)
                            const hours = Math.round(hoursRemaining % 24)
                            
                            return (
                              <p className="text-xs text-muted-foreground">
                                ETA: {daysRemaining}d {hours}h
                              </p>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {roomCards.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconHome className="size-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {myRooms.length === 0 
                    ? "No rooms found. Enter a room name to get started" 
                    : "Loading room data..."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRoom("")
                  setRoomData(null)
                  setRoomStats(null)
                  setRoomTerrain("")
                }}
              >
                <IconArrowLeft className="size-4 mr-2" />
                Back to Room List
              </Button>
              
              <TabsList className="grid w-full max-w-2xl grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="creeps">Creeps ({creeps.length})</TabsTrigger>
                <TabsTrigger value="structures">Structures</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <IconHome className="size-5" />
                    {selectedRoom}
                    {roomData?.owner && (
                      <Badge variant="outline">
                        <IconUser className="size-3 mr-1" />
                        {roomData.owner.username}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <RoomNotificationsDialog
                      roomName={selectedRoom}
                      playerName={getServerSettings().username}
                      serverUrl={getServerSettings().apiUrl}
                    >
                      <Button variant="outline" size="sm">
                        <IconBell className="size-4 mr-1" />
                        Notifications
                      </Button>
                    </RoomNotificationsDialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleFavorite(selectedRoom)}
                    >
                      {favoriteRooms.includes(selectedRoom) ? (
                        <IconStarFilled className="size-4 text-yellow-500 mr-1" />
                      ) : (
                        <IconStar className="size-4 mr-1" />
                      )}
                      {favoriteRooms.includes(selectedRoom) ? 'Favorited' : 'Favorite'}
                    </Button>
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
                <CardDescription>
                  {isMyRoom ? 'Room information and statistics' : `Viewing room information${roomData?.owner?.username ? ` (${roomData.owner.username})` : ''}`}
                </CardDescription>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isMyRoom ? 'My Creeps in' : 'Creeps in'} {selectedRoom}</CardTitle>
                    <CardDescription>{isMyRoom ? 'View and manage your creeps' : 'Creeps in this room'} ({getMyCreeps().length} total)</CardDescription>
                  </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Structures in {selectedRoom}</CardTitle>
                  </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resources in {selectedRoom}</CardTitle>
                    <CardDescription>{isMyRoom ? 'Monitor resource storage and production' : 'View resource storage in this room'}</CardDescription>
                  </div>
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
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const breakdown = getResourceBreakdown()
                  const hasAnyResources = Object.keys(breakdown.storage).length > 0 || 
                                         Object.keys(breakdown.containers).length > 0 || 
                                         Object.keys(breakdown.spawns).length > 0 || 
                                         Object.keys(breakdown.extensions).length > 0

                  if (!hasAnyResources) {
                    return <p className="text-muted-foreground text-center py-8">No resources found in storage</p>
                  }

                  return (
                    <div className="space-y-6">
                      {Object.keys(breakdown.storage).length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <IconBox className="size-5" />
                            <h3 className="font-semibold text-lg">Storage</h3>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {Object.keys(breakdown.storage).length} resource types
                            </span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(breakdown.storage).map(([resource, { current, max }]) => {
                              const percentage = (current / max) * 100
                              return (
                                <div key={resource} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <IconBox className="size-4 text-muted-foreground" />
                                    <span className="font-medium">{resource}</span>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {current.toLocaleString()} / {max.toLocaleString()}
                                      </span>
                                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" 
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {Object.keys(breakdown.containers).length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <IconBox className="size-5" />
                            <h3 className="font-semibold text-lg">Containers</h3>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {Object.keys(breakdown.containers).length} resource types
                            </span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(breakdown.containers).map(([resource, { current, max }]) => {
                              const percentage = (current / max) * 100
                              return (
                                <div key={resource} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <IconBox className="size-4 text-muted-foreground" />
                                    <span className="font-medium">{resource}</span>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {current.toLocaleString()} / {max.toLocaleString()}
                                      </span>
                                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500" 
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {(Object.keys(breakdown.spawns).length > 0 || Object.keys(breakdown.extensions).length > 0) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <IconBox className="size-5" />
                            <h3 className="font-semibold text-lg">Energy Structures</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(breakdown.spawns).length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Spawns</h4>
                                {Object.entries(breakdown.spawns).map(([resource, { current, max }]) => {
                                  const percentage = max > 0 ? (current / max) * 100 : 0
                                  return (
                                    <div key={resource} className="p-4 rounded-lg border bg-card space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{current.toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">/ {max.toLocaleString()}</span>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">Energy capacity</span>
                                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500" 
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            {Object.keys(breakdown.extensions).length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Extensions</h4>
                                {Object.entries(breakdown.extensions).map(([resource, { current, max }]) => {
                                  const percentage = max > 0 ? (current / max) * 100 : 0
                                  return (
                                    <div key={resource} className="p-4 rounded-lg border bg-card space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{current.toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">/ {max.toLocaleString()}</span>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">Energy capacity</span>
                                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500" 
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  )
}
