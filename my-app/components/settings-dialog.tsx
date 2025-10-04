"use client"

import * as React from "react"
import { IconCheck, IconSettings, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  getServerSettings,
  saveServerSettings,
  testConnection,
  type ServerSettings,
} from "@/lib/screeps-api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsFormProps {
  settings: ServerSettings
  onSettingsChange: (settings: ServerSettings) => void
}

function SettingsForm({ settings, onSettingsChange }: SettingsFormProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="apiUrl">API URL</Label>
        <Input
          id="apiUrl"
          placeholder="http://127.0.0.1:3000"
          value={settings.apiUrl}
          onChange={(e) =>
            onSettingsChange({ ...settings, apiUrl: e.target.value })
          }
        />
        <p className="text-muted-foreground text-xs">
          The base URL of your Screeps server (without /api)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Your username"
          value={settings.username}
          onChange={(e) =>
            onSettingsChange({ ...settings, username: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          value={settings.password}
          onChange={(e) =>
            onSettingsChange({ ...settings, password: e.target.value })
          }
        />
        <p className="text-muted-foreground text-xs">
          Your Screeps server password
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="shard">Shard Name</Label>
        <Input
          id="shard"
          placeholder="shard0"
          value={settings.shard}
          onChange={(e) =>
            onSettingsChange({ ...settings, shard: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="polling">Polling Interval (ms)</Label>
        <Input
          id="polling"
          type="number"
          placeholder="30000"
          value={settings.pollingInterval}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              pollingInterval: parseInt(e.target.value) || 30000,
            })
          }
        />
        <p className="text-muted-foreground text-xs">
          How often to refresh data (minimum 10000ms)
        </p>
      </div>
    </div>
  )
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)
  const [isMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })
  const [settings, setSettings] = React.useState<ServerSettings>({
    apiUrl: 'http://127.0.0.1:3000',
    username: '',
    password: '',
    pollingInterval: 30000,
    shard: 'shard0',
  })
  const [testing, setTesting] = React.useState(false)

  const handleSettingsChange = React.useCallback((newSettings: ServerSettings) => {
    setSettings(newSettings)
  }, [])

  React.useEffect(() => {
    if (open) {
      const stored = getServerSettings()
      setSettings(stored)
    }
  }, [open])

  const handleSave = () => {
    saveServerSettings(settings)
    toast.success('Settings saved successfully')
    setOpen(false)
    window.location.reload()
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const success = await testConnection(settings)
      if (success) {
        toast.success('Connection successful!', {
          icon: <IconCheck className="text-green-500" />,
        })
      } else {
        toast.error('Connection failed. Check your settings.')
      }
    } catch {
      toast.error('Connection failed. Check your settings.')
    } finally {
      setTesting(false)
    }
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <IconSettings className="size-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Server Settings</DrawerTitle>
            <DrawerDescription>
              Configure your Screeps private server connection
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <SettingsForm settings={settings} onSettingsChange={handleSettingsChange} />
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconSettings className="size-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Server Settings</DialogTitle>
          <DialogDescription>
            Configure your Screeps private server connection
          </DialogDescription>
        </DialogHeader>
        <SettingsForm settings={settings} onSettingsChange={handleSettingsChange} />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
