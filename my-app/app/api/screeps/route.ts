import { NextRequest, NextResponse } from 'next/server'

let authToken: string | null = null

interface ServerSettings {
  apiUrl: string
  username: string
  password: string
  shard: string
}

async function signin(settings: ServerSettings): Promise<string> {
  const response = await fetch(`${settings.apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: settings.username,
      password: settings.password,
    }),
  })

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  if (data.ok && data.token) {
    authToken = data.token
    return data.token
  }

  throw new Error('Invalid authentication response')
}

async function fetchWithAuth(url: string, settings: ServerSettings) {
  if (!authToken) {
    authToken = await signin(settings)
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Token': authToken,
    'X-Username': settings.username,
  }
  
  const response = await fetch(url, { headers })
  
  if (response.status === 401) {
    authToken = null
    authToken = await signin(settings)
    headers['X-Token'] = authToken
    const retryResponse = await fetch(url, { headers })
    
    if (!retryResponse.ok) {
      throw new Error(`API error: ${retryResponse.status} ${retryResponse.statusText}`)
    }
    
    return retryResponse.json()
  }
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  const newToken = response.headers.get('X-Token')
  if (newToken) {
    authToken = newToken
  }
  
  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, settings, params } = body

    if (!settings || !settings.apiUrl || !settings.username || !settings.password) {
      return NextResponse.json(
        { error: 'Missing required settings' },
        { status: 400 }
      )
    }

    let url: string
    let result: unknown

    switch (action) {
      case 'test-connection':
        authToken = null
        await signin(settings)
        url = `${settings.apiUrl}/api/auth/me`
        result = await fetchWithAuth(url, settings)
        break

      case 'console-command':
        const command = params?.command as string
        if (!command) {
          return NextResponse.json(
            { error: 'Command is required' },
            { status: 400 }
          )
        }
        
        if (!authToken) {
          authToken = await signin(settings)
        }
        
        url = `${settings.apiUrl}/api/user/console`
        const commandResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Token': authToken,
            'X-Username': settings.username,
          },
          body: JSON.stringify({
            expression: command,
            shard: settings.shard
          })
        })
        
        if (commandResponse.status === 401) {
          authToken = null
          authToken = await signin(settings)
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Token': authToken,
              'X-Username': settings.username,
            },
            body: JSON.stringify({
              expression: command,
              shard: settings.shard
            })
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Console command failed: ${retryResponse.status}`)
          }
          
          result = await retryResponse.json()
        } else if (!commandResponse.ok) {
          throw new Error(`Console command failed: ${commandResponse.status}`)
        } else {
          const newToken = commandResponse.headers.get('X-Token')
          if (newToken) {
            authToken = newToken
          }
          result = await commandResponse.json()
        }
        break

      case 'get-room-objects':
        const roomName = params?.room as string
        if (!roomName) {
          return NextResponse.json(
            { error: 'Room name is required' },
            { status: 400 }
          )
        }
        
        url = `${settings.apiUrl}/api/game/room-objects?room=${roomName}&shard=${settings.shard}`
        result = await fetchWithAuth(url, settings)
        break

      case 'get-room-stats':
        const statsRoom = params?.room as string
        if (!statsRoom) {
          return NextResponse.json(
            { error: 'Room name is required' },
            { status: 400 }
          )
        }
        
        url = `${settings.apiUrl}/api/game/room-overview?room=${statsRoom}&interval=8&shard=${settings.shard}`
        result = await fetchWithAuth(url, settings)
        break

      case 'get-room-terrain':
        const terrainRoom = params?.room as string
        if (!terrainRoom) {
          return NextResponse.json(
            { error: 'Room name is required' },
            { status: 400 }
          )
        }
        
        url = `${settings.apiUrl}/api/game/room-terrain?room=${terrainRoom}&encoded=1&shard=${settings.shard}`
        result = await fetchWithAuth(url, settings)
        break

      case 'get-user-rooms':
        const userId = params?.userId as string
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }
        
        url = `${settings.apiUrl}/api/user/rooms?id=${userId}`
        result = await fetchWithAuth(url, settings)
        break

      case 'test-room-stats':
        const testRoom = params?.room || 'E0N0'
        console.log(`\n=== Testing room stats for: ${testRoom} ===`)
        
        url = `${settings.apiUrl}/api/game/room-overview?room=${testRoom}&interval=8&shard=${settings.shard}`
        console.log(`Request URL: ${url}`)
        result = await fetchWithAuth(url, settings)
        console.log(`Response:`, JSON.stringify(result, null, 2))
        break

      case 'fetch-leaderboard':
        const limit = params?.limit || 100
        
        url = `${settings.apiUrl}/api/user/find?username=${settings.username}`
        const currentUser = await fetchWithAuth(url, settings)
        
        const allUsers: Record<string, unknown>[] = []
        const userMap = new Map<string, Record<string, unknown>>()
        
        const processUser = async (userId: string) => {
          if (userMap.has(userId)) return
          
          try {
            const userUrl = `${settings.apiUrl}/api/user/find?id=${userId}`
            const userData = await fetchWithAuth(userUrl, settings)
            
            if (userData && userData.user) {
              const user = userData.user
              userMap.set(userId, user)
              
              const roomsUrl = `${settings.apiUrl}/api/user/rooms?id=${userId}`
              const roomsData = await fetchWithAuth(roomsUrl, settings)
              const rooms = roomsData.rooms || []
              
              const roomDetails = await Promise.all(
                rooms.map((room: string) => 
                  fetchWithAuth(
                    `${settings.apiUrl}/api/game/room-objects?room=${room}&shard=${settings.shard}`,
                    settings
                  ).catch(() => null)
                )
              )
              
              const validRooms = roomDetails.filter(r => r && r.objects)
              let totalRCL = 0
              let controllerCount = 0
              
              for (const roomData of validRooms) {
                const controllers = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'controller' && obj.user === userId && obj.level)
                if (controllers.length > 0) {
                  totalRCL += controllers[0].level
                  controllerCount++
                }
              }
              
              const avgRCL = controllerCount > 0 ? totalRCL / controllerCount : 0
              
              const userStats = {
                totalCreeps: 0,
                totalSpawns: 0,
                totalTowers: 0,
                totalExtensions: 0,
                totalStorage: 0,
              }
              
              try {
                
                for (const roomData of validRooms) {
                  if (roomData && roomData.objects) {
                    const creeps = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'creep' && obj.user === userId)
                    const spawns = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'spawn' && obj.user === userId)
                    const towers = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'tower' && obj.user === userId)
                    const extensions = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'extension' && obj.user === userId)
                    const storages = roomData.objects.filter((obj: Record<string, unknown>) => obj.type === 'storage' && obj.user === userId)
                    
                    userStats.totalCreeps += creeps.length
                    userStats.totalSpawns += spawns.length
                    userStats.totalTowers += towers.length
                    userStats.totalExtensions += extensions.length
                    userStats.totalStorage += storages.length
                  }
                }
                
              } catch (e) {
                console.error(`Error counting objects for ${user.username}:`, e)
              }
              
              allUsers.push({
                _id: user._id,
                username: user.username,
                rooms: rooms.length,
                gcl: user.gcl || 0,
                totalCreeps: userStats.totalCreeps,
                totalSpawns: userStats.totalSpawns,
                totalTowers: userStats.totalTowers,
                totalExtensions: userStats.totalExtensions,
                totalStorage: userStats.totalStorage,
                avgRCL: Math.round(avgRCL * 10) / 10,
              })
              
              for (const roomDetail of validRooms) {
                if (roomDetail.owner && roomDetail.owner.username && roomDetail.owner.username !== user.username) {
                  const neighborUrl = `${settings.apiUrl}/api/user/find?username=${roomDetail.owner.username}`
                  const neighborData = await fetchWithAuth(neighborUrl, settings).catch(() => null)
                  if (neighborData && neighborData.user && !userMap.has(neighborData.user._id)) {
                    await processUser(neighborData.user._id)
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error processing user ${userId}:`, e)
          }
        }
        
        if (currentUser && currentUser.user) {
          await processUser(currentUser.user._id)
        }
        
        let scannedRooms = 0
        const maxScans = 1000
        
        for (let x = -10; x <= 10 && scannedRooms < maxScans; x++) {
          for (let y = -10; y <= 10 && scannedRooms < maxScans; y++) {
            if (x === 0 && y === 0) continue
            
            const roomName = `${x < 0 ? 'W' : 'E'}${Math.abs(x)}${y < 0 ? 'S' : 'N'}${Math.abs(y)}`
            scannedRooms++
            
            try {
              const roomUrl = `${settings.apiUrl}/api/game/room-overview?room=${roomName}&interval=8&shard=${settings.shard}`
              const roomData = await fetchWithAuth(roomUrl, settings).catch(() => null)
              
              if (roomData && roomData.owner && roomData.owner.username) {
                const ownerUrl = `${settings.apiUrl}/api/user/find?username=${roomData.owner.username}`
                const ownerData = await fetchWithAuth(ownerUrl, settings).catch(() => null)
                
                if (ownerData && ownerData.user && !userMap.has(ownerData.user._id)) {
                  await processUser(ownerData.user._id)
                }
              }
            } catch {
            }
          }
        }
        
        result = allUsers.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.gcl as number) - (a.gcl as number)).slice(0, limit)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
