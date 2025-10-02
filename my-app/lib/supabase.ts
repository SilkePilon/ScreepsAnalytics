import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtmfcodffzedckszlwjb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bWZjb2RmZnplZGNrc3psd2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODMzNzgsImV4cCI6MjA3NDk1OTM3OH0.qTO1GERV-xm7pH7RtJuirODfzqhf5k-o9fd1l-8NQSw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ConsoleAction {
  id?: string
  player_name: string
  server_url: string
  name: string
  emoji: string
  command: string
  result?: string
  success?: boolean
  executed_at?: string
  created_at?: string
}

export interface AuthenticatedPlayer {
  id?: string
  player_name: string
  server_url: string
  last_authenticated_at?: string
  created_at?: string
}

export interface FavoriteRoom {
  id?: string
  player_name: string
  server_url: string
  room_name: string
  created_at?: string
}

const FAVORITES_CACHE_KEY = 'screeps_favorite_rooms_cache'
const FAVORITES_CACHE_TIMESTAMP_KEY = 'screeps_favorite_rooms_cache_timestamp'
const CACHE_DURATION = 24 * 60 * 60 * 1000

export async function getFavoriteRooms(playerName: string, serverUrl: string): Promise<string[]> {
  if (typeof window === 'undefined') return []
  
  const cacheTimestamp = localStorage.getItem(FAVORITES_CACHE_TIMESTAMP_KEY)
  const cachedData = localStorage.getItem(FAVORITES_CACHE_KEY)
  
  if (cacheTimestamp && cachedData) {
    const timestamp = parseInt(cacheTimestamp, 10)
    if (Date.now() - timestamp < CACHE_DURATION) {
      try {
        return JSON.parse(cachedData)
      } catch (e) {
        console.error('Failed to parse cached favorites:', e)
      }
    }
  }
  
  const { data, error } = await supabase
    .from('favorite_rooms')
    .select('room_name')
    .eq('player_name', playerName)
    .eq('server_url', serverUrl)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching favorite rooms:', error)
    return []
  }
  
  const roomNames = data.map(item => item.room_name)
  localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(roomNames))
  localStorage.setItem(FAVORITES_CACHE_TIMESTAMP_KEY, Date.now().toString())
  
  return roomNames
}

export async function addFavoriteRoom(playerName: string, serverUrl: string, roomName: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorite_rooms')
    .insert({
      player_name: playerName,
      server_url: serverUrl,
      room_name: roomName
    })
  
  if (error) {
    console.error('Error adding favorite room:', error)
    return false
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FAVORITES_CACHE_KEY)
    localStorage.removeItem(FAVORITES_CACHE_TIMESTAMP_KEY)
  }
  
  return true
}

export async function removeFavoriteRoom(playerName: string, serverUrl: string, roomName: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorite_rooms')
    .delete()
    .eq('player_name', playerName)
    .eq('server_url', serverUrl)
    .eq('room_name', roomName)
  
  if (error) {
    console.error('Error removing favorite room:', error)
    return false
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FAVORITES_CACHE_KEY)
    localStorage.removeItem(FAVORITES_CACHE_TIMESTAMP_KEY)
  }
  
  return true
}

export function clearFavoritesCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FAVORITES_CACHE_KEY)
    localStorage.removeItem(FAVORITES_CACHE_TIMESTAMP_KEY)
  }
}

export async function recordAuthenticatedPlayer(playerName: string, serverUrl: string) {
  const { data, error } = await supabase
    .from('authenticated_players')
    .upsert(
      { 
        player_name: playerName, 
        server_url: serverUrl,
        last_authenticated_at: new Date().toISOString()
      },
      { onConflict: 'player_name' }
    )
    .select()
  
  if (error) {
    console.error('Error recording authenticated player:', error)
    return null
  }
  
  return data
}

export async function recordConsoleAction(
  playerName: string,
  serverUrl: string,
  command: string,
  result?: string,
  success: boolean = true
) {
  const { data, error } = await supabase
    .from('console_actions')
    .insert({
      player_name: playerName,
      server_url: serverUrl,
      command,
      result,
      success,
      executed_at: new Date().toISOString()
    })
    .select()
  
  if (error) {
    console.error('Error recording console action:', error)
    return null
  }
  
  return data
}

export async function getConsoleActions(playerName: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('console_actions')
    .select('*')
    .eq('player_name', playerName)
    .order('executed_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching console actions:', error)
    return []
  }
  
  return data
}

export async function isPlayerAuthenticated(playerName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('authenticated_players')
    .select('player_name')
    .eq('player_name', playerName)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return true
}
