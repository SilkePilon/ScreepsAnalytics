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
