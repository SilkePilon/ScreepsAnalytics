"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IconTrophy, IconRefresh } from "@tabler/icons-react"
import { getServerSettings } from "@/lib/screeps-api"

interface KOTHPlayer {
  id: string
  username: string
  score: number
}

interface KOTHLeaderboardResponse {
  ok: boolean
  leaderboard: KOTHPlayer[]
}

export function KOTHLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<KOTHPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchKOTHLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const settings = getServerSettings()
      
      const response = await fetch('/api/koth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch KOTH leaderboard: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const data: KOTHLeaderboardResponse = result.data
        
        if (data.ok && data.leaderboard) {
          setLeaderboard(data.leaderboard)
          setLastUpdate(new Date())
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error(result.error || 'Failed to load KOTH leaderboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KOTH leaderboard')
      console.error('KOTH leaderboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKOTHLeaderboard()
  }, [fetchKOTHLeaderboard])

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>
    if (index === 1) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>
    if (index === 2) return <Badge className="bg-orange-600 hover:bg-orange-700">🥉 3rd</Badge>
    return <Badge variant="outline">{index + 1}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconTrophy className="size-5" />
              King of the Hill Leaderboard
            </CardTitle>
            <CardDescription>
              {lastUpdate && (
                <span className="text-xs">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <button
            onClick={fetchKOTHLeaderboard}
            disabled={loading}
            className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <IconRefresh className={`size-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
            <p className="text-destructive text-center px-4">{error}</p>
            <button
              onClick={fetchKOTHLeaderboard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        ) : loading && leaderboard.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">Loading KOTH leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">No players on the leaderboard yet</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((player, index) => (
                  <TableRow key={player.id} className={index < 3 ? 'bg-accent/50' : ''}>
                    <TableCell className="font-medium">
                      {getRankBadge(index)}
                    </TableCell>
                    <TableCell className="font-medium">{player.username}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {player.score.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
