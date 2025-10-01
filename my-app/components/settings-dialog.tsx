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
import { useIsMobile } from "@/hooks/use-mobile"

export function SettingsDialog() {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<ServerSettings>({
    apiUrl: 'http://127.0.0.1:3000',
    username: '',
    password: '',
    pollingInterval: 30000,
    shard: 'shard0',
  })
  const [testing, setTesting] = React.useState(false)

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

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
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
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              placeholder="http://127.0.0.1:3000"
              value={settings.apiUrl}
              onChange={(e) =>
                setSettings({ ...settings, apiUrl: e.target.value })
              }
            />
            <p className="text-muted-foreground text-xs">
              The base URL of your Screeps server (without /api)
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Your username"
              value={settings.username}
              onChange={(e) =>
                setSettings({ ...settings, username: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={settings.password}
              onChange={(e) =>
                setSettings({ ...settings, password: e.target.value })
              }
            />
            <p className="text-muted-foreground text-xs">
              Your Screeps server password
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="shard">Shard Name</Label>
            <Input
              id="shard"
              placeholder="shard0"
              value={settings.shard}
              onChange={(e) =>
                setSettings({ ...settings, shard: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="polling">Polling Interval (ms)</Label>
            <Input
              id="polling"
              type="number"
              placeholder="30000"
              value={settings.pollingInterval}
              onChange={(e) =>
                setSettings({
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
        <DrawerFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testing}
            className="flex-1"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="icon">
              <IconX />
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
