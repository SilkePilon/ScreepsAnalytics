"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartsGrid } from "@/components/charts-grid"
import { PlayerLeaderboard } from "@/components/player-leaderboard"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchLeaderboard, getServerSettings, type UserStats } from "@/lib/screeps-api"
import { toast } from "sonner"

export default function Page() {
  const [players, setPlayers] = React.useState<UserStats[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = getServerSettings()
      const data = await fetchLeaderboard(settings, 100)
      setPlayers(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load data'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()

    const settings = getServerSettings()
    const interval = Math.max(settings.pollingInterval, 10000)
    const timer = setInterval(loadData, interval)

    return () => clearInterval(timer)
  }, [loadData])

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader onRefresh={loadData} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards players={players} loading={loading} />
              
              <Tabs defaultValue="charts" className="px-4 lg:px-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
                  <TabsTrigger value="table">Leaderboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="charts" className="mt-6">
                  {loading && players.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-destructive">{error}</p>
                      <button
                        onClick={loadData}
                        className="text-primary hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <ChartsGrid players={players} />
                  )}
                </TabsContent>
                
                <TabsContent value="table" className="mt-6">
                  {loading && players.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Loading player data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-destructive">{error}</p>
                      <button
                        onClick={loadData}
                        className="text-primary hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <PlayerLeaderboard data={players} />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
