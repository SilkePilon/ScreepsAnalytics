export interface ScreepsUser {
  _id: string
  username: string
  gcl?: number
  rooms?: string[]
  badge?: {
    type: number
    color1: string
    color2: string
    color3: string
    param: number
    flip: boolean
  }
}

export interface ScreepsRoom {
  _id: string
  owner?: {
    username: string
  }
  level?: number
}

export interface UserStats {
  _id: string
  username: string
  rooms: number
  gcl: number
  totalCreeps: number
  totalSpawns: number
  totalTowers: number
  totalExtensions: number
  totalStorage: number
  avgRCL: number
}

export interface ServerSettings {
  apiUrl: string
  username: string
  password: string
  pollingInterval: number
  shard: string
}

const DEFAULT_SETTINGS: ServerSettings = {
  apiUrl: 'http://127.0.0.1:3000',
  username: '',
  password: '',
  pollingInterval: 30000,
  shard: 'shard0',
}

export function getServerSettings(): ServerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  const stored = localStorage.getItem('screeps-settings')
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch (e) {
      console.error('Failed to parse settings', e)
    }
  }
  return DEFAULT_SETTINGS
}

export function saveServerSettings(settings: Partial<ServerSettings>) {
  if (typeof window === 'undefined') return
  
  const current = getServerSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem('screeps-settings', JSON.stringify(updated))
}

async function callServerAPI(action: string, settings: ServerSettings, params?: any) {
  const response = await fetch('/api/screeps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, settings, params }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }

  const result = await response.json()
  return result.data
}

export async function testConnection(settings: ServerSettings): Promise<boolean> {
  try {
    await callServerAPI('test-connection', settings)
    return true
  } catch (e) {
    console.error('Connection test failed', e)
    return false
  }
}

export async function fetchLeaderboard(settings: ServerSettings, limit: number = 50): Promise<UserStats[]> {
  try {
    const data = await callServerAPI('fetch-leaderboard', settings, { limit })
    return data
  } catch (e) {
    console.error('Failed to fetch leaderboard', e)
    throw e
  }
}
