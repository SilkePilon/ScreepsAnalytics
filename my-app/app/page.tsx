"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartsGrid } from "@/components/charts-grid"
import { PlayerLeaderboard } from "@/components/player-leaderboard"
import { PlayersGrid } from "@/components/players-grid"
import { ConsoleActions } from "@/components/console-actions"
import { GlobalSay } from "@/components/global-say"
import { RoomControl } from "@/components/room-control"
import { SiteHeader } from "@/components/site-header"
import { NotificationWorker } from "@/components/notification-worker"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchLeaderboard, getServerSettings, type UserStats } from "@/lib/screeps-api"
import { toast } from "sonner"

export default function Page() {
  const [players, setPlayers] = React.useState<UserStats[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [analyticsLoaded, setAnalyticsLoaded] = React.useState(false)
  const [showLeftShadow, setShowLeftShadow] = React.useState(false)
  const [showRightShadow, setShowRightShadow] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [settings, setSettings] = React.useState(() => getServerSettings())

  const handleScroll = React.useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const { scrollLeft, scrollWidth, clientWidth } = element
    setShowLeftShadow(scrollLeft > 0)
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  React.useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    handleScroll()
    element.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    return () => {
      element.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = getServerSettings()
      const data = await fetchLeaderboard(settings, 100)
      setPlayers(data)
      setAnalyticsLoaded(true)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load data'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const settings = getServerSettings()
    const interval = Math.max(settings.pollingInterval, 10000)
    const timer = setInterval(() => {
      if (analyticsLoaded) {
        loadData()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [loadData, analyticsLoaded])

  React.useEffect(() => {
    const handleStorageChange = () => {
      setSettings(getServerSettings())
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      setSettings(getServerSettings())
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <NotificationWorker 
        playerName={settings.username || null} 
        serverUrl={settings.apiUrl || null} 
      />
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              <Tabs defaultValue="charts" className="px-4 lg:px-6">
                <div className="relative">
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 lg:hidden transition-opacity duration-300 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div 
                    className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 lg:hidden transition-opacity duration-300 ${showRightShadow ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
                    <TabsList className="grid w-full max-w-4xl grid-cols-5 min-w-max">
                      <TabsTrigger value="charts">Analytics</TabsTrigger>
                      <TabsTrigger value="players">Players</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="rooms">Rooms</TabsTrigger>
                      <TabsTrigger value="table">Leaderboard</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <TabsContent value="charts" className="mt-6">
                  {!analyticsLoaded ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-muted-foreground text-center px-4">Analytics not loaded. Click below to load data.</p>
                      <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load Analytics'}
                      </button>
                    </div>
                  ) : loading && players.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-destructive text-center px-4">{error}</p>
                      <button
                        onClick={loadData}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button
                          onClick={loadData}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                          {loading ? 'Refreshing...' : 'Refresh Analytics'}
                        </button>
                      </div>
                      <ChartsGrid players={players} />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="players" className="mt-6">
                  {!analyticsLoaded ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-muted-foreground text-center px-4">Analytics not loaded. Load analytics first to view players.</p>
                      <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load Analytics'}
                      </button>
                    </div>
                  ) : loading && players.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Loading players...</p>
                    </div>
                  ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-destructive text-center px-4">{error}</p>
                      <button
                        onClick={loadData}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <PlayersGrid players={players} />
                  )}
                </TabsContent>
                
                <TabsContent value="actions" className="mt-6">
                  <Tabs defaultValue="console" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                      <TabsTrigger value="console">Console Actions</TabsTrigger>
                      <TabsTrigger value="globalsay">Global Say</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="console" className="mt-6">
                      <ConsoleActions />
                    </TabsContent>
                    
                    <TabsContent value="globalsay" className="mt-6">
                      <GlobalSay />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="rooms" className="mt-6">
                  <RoomControl />
                </TabsContent>
                
                <TabsContent value="table" className="mt-6">
                  {!analyticsLoaded ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-muted-foreground text-center px-4">Analytics not loaded. Load analytics first to view leaderboard.</p>
                      <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load Analytics'}
                      </button>
                    </div>
                  ) : loading && players.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Loading player data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                      <p className="text-destructive text-center px-4">{error}</p>
                      <button
                        onClick={loadData}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
    </>
  )
}
