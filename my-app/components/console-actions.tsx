"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconPlus, IconTrash, IconPlayerPlay } from "@tabler/icons-react"
import { toast } from "sonner"
import { getServerSettings } from "@/lib/screeps-api"
import { supabase, recordAuthenticatedPlayer } from "@/lib/supabase"

interface ConsoleAction {
  id?: string
  name: string
  emoji: string
  command: string
  player_name?: string
  server_url?: string
}

const EMOJI_OPTIONS = [
  { value: "🚀", label: "🚀 Rocket" },
  { value: "⚡", label: "⚡ Zap" },
  { value: "🔥", label: "🔥 Fire" },
  { value: "💎", label: "💎 Gem" },
  { value: "🎯", label: "🎯 Target" },
  { value: "🛡️", label: "🛡️ Shield" },
  { value: "⚔️", label: "⚔️ Sword" },
  { value: "🏗️", label: "🏗️ Construction" },
  { value: "🔧", label: "🔧 Wrench" },
  { value: "💰", label: "💰 Money" },
  { value: "📊", label: "📊 Chart" },
  { value: "🎮", label: "🎮 Game" },
  { value: "🤖", label: "🤖 Robot" },
  { value: "🌟", label: "🌟 Star" },
  { value: "💥", label: "💥 Boom" },
  { value: "🔔", label: "🔔 Bell" },
  { value: "⏰", label: "⏰ Alarm" },
  { value: "🎪", label: "🎪 Circus" },
  { value: "🎨", label: "🎨 Art" },
  { value: "🔮", label: "🔮 Crystal" },
]

export function ConsoleActions() {
  const [actions, setActions] = useState<ConsoleAction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<ConsoleAction | null>(null)
  const [formData, setFormData] = useState({ name: "", emoji: "🚀", command: "" })
  const [executing, setExecuting] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const settings = getServerSettings()
        
        const response = await fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'test-connection',
            settings
          })
        })

        if (response.ok) {
          const result = await response.json()
          const username = result.data?.username
          
          if (username) {
            setPlayerName(username)
            await recordAuthenticatedPlayer(username, settings.apiUrl)
            await loadActions(username)
          } else {
            toast.error("Please configure your server credentials first")
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
        toast.error("Failed to authenticate. Please check your server settings.")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const loadActions = async (username: string) => {
    try {
      const CACHE_KEY = `screeps_console_actions_${username}`
      const CACHE_DURATION = 60 * 60 * 1000
      
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        try {
          const { actions: cachedActions, timestamp } = JSON.parse(cachedData)
          const age = Date.now() - timestamp
          if (age < CACHE_DURATION) {
            setActions(cachedActions)
            return
          }
        } catch (e) {
          console.error('Failed to parse cached actions:', e)
        }
      }

      const { data, error } = await supabase
        .from('console_actions')
        .select('*')
        .eq('player_name', username)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const actionsData = data || []
      setActions(actionsData)
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        actions: actionsData,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to load actions:', error)
      toast.error("Failed to load console actions")
    }
  }

  const clearActionsCache = (username: string) => {
    const CACHE_KEY = `screeps_console_actions_${username}`
    localStorage.removeItem(CACHE_KEY)
  }

  const handleSaveAction = async () => {
    if (!formData.name.trim() || !formData.command.trim()) {
      toast.error("Name and command are required")
      return
    }

    if (!playerName) {
      toast.error("Not authenticated. Please configure server settings.")
      return
    }

    try {
      const settings = getServerSettings()
      
      if (editingAction && editingAction.id) {
        const { error } = await supabase
          .from('console_actions')
          .update({
            name: formData.name,
            emoji: formData.emoji,
            command: formData.command
          })
          .eq('id', editingAction.id)

        if (error) throw error
        toast.success("Action updated")
      } else {
        const { error } = await supabase
          .from('console_actions')
          .insert({
            player_name: playerName,
            server_url: settings.apiUrl,
            name: formData.name,
            emoji: formData.emoji,
            command: formData.command
          })

        if (error) throw error
        toast.success("Action created")
      }

      clearActionsCache(playerName)
      await loadActions(playerName)
      setIsDialogOpen(false)
      setEditingAction(null)
      setFormData({ name: "", emoji: "🚀", command: "" })
    } catch (error) {
      console.error('Failed to save action:', error)
      toast.error("Failed to save action")
    }
  }

  const handleDeleteAction = async (id: string) => {
    if (!playerName) return

    try {
      const { error } = await supabase
        .from('console_actions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      clearActionsCache(playerName)
      await loadActions(playerName)
      toast.success("Action deleted")
    } catch (error) {
      console.error('Failed to delete action:', error)
      toast.error("Failed to delete action")
    }
  }

  const handleExecuteAction = async (action: ConsoleAction) => {
    if (!action.id) return
    
    setExecuting(action.id)
    try {
      const settings = getServerSettings()
      const response = await fetch('/api/screeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'console-command',
          settings,
          params: { command: action.command }
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Executed: ${action.name}`, {
          description: result.data?.result || "Command sent successfully"
        })
      } else {
        toast.error("Failed to execute command", {
          description: result.error
        })
      }
    } catch (error) {
      toast.error("Failed to execute command", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setExecuting(null)
    }
  }

  const openEditDialog = (action: ConsoleAction) => {
    setEditingAction(action)
    setFormData({ name: action.name, emoji: action.emoji, command: action.command })
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingAction(null)
    setFormData({ name: "", emoji: "🚀", command: "" })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading console actions...</p>
          </CardContent>
        </Card>
      ) : !playerName ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Please configure your server credentials in Settings</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Console Actions</h2>
              <p className="text-muted-foreground">Create custom buttons to execute game console commands (Saved for {playerName})</p>
            </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <IconPlus className="size-4" />
              New Action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAction ? "Edit Action" : "Create Action"}</DialogTitle>
              <DialogDescription>
                {editingAction ? "Update your console action" : "Add a new console action button"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Button Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Spawn Creeps"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emoji">Emoji</Label>
                <Select value={formData.emoji} onValueChange={(value) => setFormData({ ...formData, emoji: value })}>
                  <SelectTrigger id="emoji">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOJI_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="command">Console Command</Label>
                <Input
                  id="command"
                  placeholder="e.g., Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], 'Worker1')"
                  value={formData.command}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAction}>Save Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No actions created yet</p>
            <Button onClick={openNewDialog}>
              <IconPlus className="size-4" />
              Create Your First Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Card key={action.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{action.emoji}</span>
                  <span>{action.name}</span>
                </CardTitle>
                <CardDescription className="font-mono text-xs">{action.command}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleExecuteAction(action)}
                  disabled={executing === action.id}
                >
                  <IconPlayerPlay className="size-4" />
                  {executing === action.id ? "Executing..." : "Execute"}
                </Button>
                <Button variant="outline" onClick={() => openEditDialog(action)}>
                  Edit
                </Button>
                <Button variant="destructive" size="icon" onClick={() => action.id && handleDeleteAction(action.id)}>
                  <IconTrash className="size-4" />
                </Button>
              </CardContent>
          </Card>
        ))}
      </div>
    )}
    </>
  )}
    </div>
  )
}