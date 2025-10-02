"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconHome, IconRefresh, IconSearch } from "@tabler/icons-react"

export function RoomControl() {
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [roomSearch, setRoomSearch] = useState<string>("")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Room Control</h2>
        <p className="text-muted-foreground">Monitor and control your rooms</p>
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
              onChange={(e) => setRoomSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setSelectedRoom(roomSearch)}>
          <IconHome className="size-4" />
          Load Room
        </Button>
      </div>

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
            <TabsTrigger value="creeps">Creeps</TabsTrigger>
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
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <IconRefresh className="size-4" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>Room information and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Controller Level</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Available</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Capacity</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Creeps Count</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Connect to your server to load room data
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creeps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Creeps in {selectedRoom}</CardTitle>
                <CardDescription>View and manage your creeps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Creep management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Structures in {selectedRoom}</CardTitle>
                <CardDescription>View room structures and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Structure management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resources in {selectedRoom}</CardTitle>
                <CardDescription>Monitor resource storage and production</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Resource monitoring coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
