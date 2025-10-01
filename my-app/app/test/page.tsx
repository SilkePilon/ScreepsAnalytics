"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSettings } from "@/lib/screeps-api"

export default function TestPage() {
  const [room, setRoom] = useState("E0N0")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testRoomStats = async () => {
    setLoading(true)
    try {
      const settings = getServerSettings()
      const res = await fetch('/api/screeps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-room-stats', 
          settings, 
          params: { room } 
        }),
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>API Response Tester</CardTitle>
          <CardDescription>
            Test room-overview endpoint to see actual API response structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room">Room Name</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="E0N0"
            />
          </div>

          <Button onClick={testRoomStats} disabled={loading}>
            {loading ? "Testing..." : "Test Room Stats"}
          </Button>

          {response && (
            <div className="mt-4">
              <Label>API Response:</Label>
              <pre className="mt-2 rounded-lg bg-slate-950 p-4 text-sm text-slate-50 overflow-auto max-h-[600px]">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure you have configured your server settings in the main dashboard</li>
            <li>Enter a room name that exists on your server (e.g., E0N0, W0N0)</li>
            <li>Click "Test Room Stats" to see the actual API response</li>
            <li>Check the server console logs for detailed debugging information</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
