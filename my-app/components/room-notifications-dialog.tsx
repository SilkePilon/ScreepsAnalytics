"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconBell, IconBellOff, IconAlertTriangle, IconBolt, IconShield, IconFlame, IconClock, IconInfoCircle } from "@tabler/icons-react"
import { toast } from "sonner"

interface RoomNotificationConfig {
  enabled: boolean
  
  controllerUpgradeEnabled: boolean
  controllerDowngradeEnabled: boolean
  
  energyLowEnabled: boolean
  energyLowThreshold: number
  energyCriticalEnabled: boolean
  energyCriticalThreshold: number
  
  hostileCreepsEnabled: boolean
  hostileCreepsThreshold: number
  
  towerLowEnergyEnabled: boolean
  towerLowEnergyThreshold: number
  
  spawnIdleEnabled: boolean
  
  storageFullEnabled: boolean
  storageFullThreshold: number
  
  rampartLowHitsEnabled: boolean
  rampartLowHitsThreshold: number
  
  wallLowHitsEnabled: boolean
  wallLowHitsThreshold: number
  
  checkInterval: number
  notificationCooldown: number
}

interface RoomNotificationsDialogProps {
  roomName: string
  playerName: string
  serverUrl: string
  children: React.ReactNode
}

const defaultConfig: RoomNotificationConfig = {
  enabled: false,
  controllerUpgradeEnabled: false,
  controllerDowngradeEnabled: false,
  energyLowEnabled: false,
  energyLowThreshold: 5000,
  energyCriticalEnabled: false,
  energyCriticalThreshold: 1000,
  hostileCreepsEnabled: false,
  hostileCreepsThreshold: 1,
  towerLowEnergyEnabled: false,
  towerLowEnergyThreshold: 500,
  spawnIdleEnabled: false,
  storageFullEnabled: false,
  storageFullThreshold: 90,
  rampartLowHitsEnabled: false,
  rampartLowHitsThreshold: 10000,
  wallLowHitsEnabled: false,
  wallLowHitsThreshold: 10000,
  checkInterval: 60,
  notificationCooldown: 300
}

function NotificationForm({ roomName, playerName, serverUrl, onClose }: RoomNotificationsDialogProps & { onClose: () => void }) {
  const [config, setConfig] = useState<RoomNotificationConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [roomName, playerName, serverUrl])

  const sendTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return
    }

    if (Notification.permission !== 'granted') {
      toast.error('Please grant notification permission first')
      requestNotificationPermission()
      return
    }

    new Notification(`Screeps - ${roomName}`, {
      body: 'This is a test notification. Your notifications are working correctly!',
      icon: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
    })
    toast.success('Test notification sent')
  }

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return
    }

    if (Notification.permission === 'granted') {
      toast.success('Notification permission already granted')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        toast.success('Notification permission granted')
        new Notification('Screeps Analytics', {
          body: `Notifications enabled for ${roomName}`,
          icon: '/favicon.ico',
          tag: 'test-notification'
        })
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable in browser settings.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to request notification permission')
    }
  }

  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/room-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          playerName,
          serverUrl,
          roomName
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig(data.config)
        }
      }
    } catch (error) {
      console.error('Failed to load notification config:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (config.enabled && notificationPermission !== 'granted') {
      toast.error('Please grant notification permission first')
      await requestNotificationPermission()
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/room-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          playerName,
          serverUrl,
          roomName,
          config
        })
      })

      if (response.ok) {
        toast.success(config.enabled ? 'Notification settings saved' : 'Notifications disabled')
        onClose()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Failed to save notification config:', error)
      toast.error('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (updates: Partial<RoomNotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const getOptimalCheckInterval = () => {
    const activeNotifications = [
      config.controllerUpgradeEnabled,
      config.controllerDowngradeEnabled,
      config.energyLowEnabled,
      config.energyCriticalEnabled,
      config.hostileCreepsEnabled,
      config.towerLowEnergyEnabled,
      config.spawnIdleEnabled,
      config.storageFullEnabled,
      config.rampartLowHitsEnabled,
      config.wallLowHitsEnabled
    ].filter(Boolean).length

    if (activeNotifications === 0) return 300
    if (config.hostileCreepsEnabled) return 30
    if (config.energyCriticalEnabled) return 45
    if (activeNotifications >= 5) return 60
    if (activeNotifications >= 3) return 90
    return 120
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const optimalInterval = getOptimalCheckInterval()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Notifications for {roomName}</h3>
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure alerts for room events and conditions
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </div>

      {config.enabled && (
        <>
          {notificationPermission !== 'granted' && (
            <div className="rounded-lg border border-orange-500/50 p-4 bg-orange-500/10">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="size-5 text-orange-500 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium">Notification Permission Required</p>
                  <p className="text-xs text-muted-foreground">
                    You need to grant notification permission to receive alerts from this room.
                    {notificationPermission === 'denied' && ' Please enable notifications in your browser settings.'}
                  </p>
                  {notificationPermission !== 'denied' && (
                    <Button
                      size="sm"
                      onClick={requestNotificationPermission}
                      className="mt-2"
                    >
                      <IconBell className="size-4 mr-2" />
                      Grant Permission
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="size-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">Smart Polling</p>
                <p className="text-xs text-muted-foreground">
                  Based on your selected notifications, we recommend checking every{' '}
                  <span className="font-semibold text-foreground">{optimalInterval}s</span>.
                  {optimalInterval !== config.checkInterval && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-1 text-xs"
                      onClick={() => updateConfig({ checkInterval: optimalInterval })}
                    >
                      Apply recommendation
                    </Button>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="controller">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <IconAlertTriangle className="size-4" />
                  Controller Events
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Controller Upgraded</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify when room controller level increases
                    </p>
                  </div>
                  <Switch
                    checked={config.controllerUpgradeEnabled}
                    onCheckedChange={(checked) => updateConfig({ controllerUpgradeEnabled: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Controller Downgraded</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify when room controller level decreases
                    </p>
                  </div>
                  <Switch
                    checked={config.controllerDowngradeEnabled}
                    onCheckedChange={(checked) => updateConfig({ controllerDowngradeEnabled: checked })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="energy">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <IconBolt className="size-4" />
                  Energy Alerts
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Low Energy Warning</Label>
                    <Switch
                      checked={config.energyLowEnabled}
                      onCheckedChange={(checked) => updateConfig({ energyLowEnabled: checked })}
                    />
                  </div>
                  {config.energyLowEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.energyLowThreshold.toLocaleString()} energy
                      </Label>
                      <Slider
                        value={[config.energyLowThreshold]}
                        onValueChange={([value]) => updateConfig({ energyLowThreshold: value })}
                        min={1000}
                        max={50000}
                        step={1000}
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Critical Energy Alert</Label>
                    <Switch
                      checked={config.energyCriticalEnabled}
                      onCheckedChange={(checked) => updateConfig({ energyCriticalEnabled: checked })}
                    />
                  </div>
                  {config.energyCriticalEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.energyCriticalThreshold.toLocaleString()} energy
                      </Label>
                      <Slider
                        value={[config.energyCriticalThreshold]}
                        onValueChange={([value]) => updateConfig({ energyCriticalThreshold: value })}
                        min={100}
                        max={10000}
                        step={100}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="defense">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <IconShield className="size-4" />
                  Defense Alerts
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Hostile Creeps Detected</Label>
                    <Switch
                      checked={config.hostileCreepsEnabled}
                      onCheckedChange={(checked) => updateConfig({ hostileCreepsEnabled: checked })}
                    />
                  </div>
                  {config.hostileCreepsEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Alert when {config.hostileCreepsThreshold}+ hostile creeps detected
                      </Label>
                      <Slider
                        value={[config.hostileCreepsThreshold]}
                        onValueChange={([value]) => updateConfig({ hostileCreepsThreshold: value })}
                        min={1}
                        max={20}
                        step={1}
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Rampart Low Hits</Label>
                    <Switch
                      checked={config.rampartLowHitsEnabled}
                      onCheckedChange={(checked) => updateConfig({ rampartLowHitsEnabled: checked })}
                    />
                  </div>
                  {config.rampartLowHitsEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.rampartLowHitsThreshold.toLocaleString()} hits
                      </Label>
                      <Slider
                        value={[config.rampartLowHitsThreshold]}
                        onValueChange={([value]) => updateConfig({ rampartLowHitsThreshold: value })}
                        min={1000}
                        max={100000}
                        step={1000}
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Wall Low Hits</Label>
                    <Switch
                      checked={config.wallLowHitsEnabled}
                      onCheckedChange={(checked) => updateConfig({ wallLowHitsEnabled: checked })}
                    />
                  </div>
                  {config.wallLowHitsEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.wallLowHitsThreshold.toLocaleString()} hits
                      </Label>
                      <Slider
                        value={[config.wallLowHitsThreshold]}
                        onValueChange={([value]) => updateConfig({ wallLowHitsThreshold: value })}
                        min={1000}
                        max={100000}
                        step={1000}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="structures">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <IconFlame className="size-4" />
                  Structure Alerts
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Tower Low Energy</Label>
                    <Switch
                      checked={config.towerLowEnergyEnabled}
                      onCheckedChange={(checked) => updateConfig({ towerLowEnergyEnabled: checked })}
                    />
                  </div>
                  {config.towerLowEnergyEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.towerLowEnergyThreshold.toLocaleString()} energy
                      </Label>
                      <Slider
                        value={[config.towerLowEnergyThreshold]}
                        onValueChange={([value]) => updateConfig({ towerLowEnergyThreshold: value })}
                        min={100}
                        max={1000}
                        step={50}
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Spawn Idle</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify when spawns are not producing creeps
                    </p>
                  </div>
                  <Switch
                    checked={config.spawnIdleEnabled}
                    onCheckedChange={(checked) => updateConfig({ spawnIdleEnabled: checked })}
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Storage Nearly Full</Label>
                    <Switch
                      checked={config.storageFullEnabled}
                      onCheckedChange={(checked) => updateConfig({ storageFullEnabled: checked })}
                    />
                  </div>
                  {config.storageFullEnabled && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label className="text-xs text-muted-foreground">
                        Threshold: {config.storageFullThreshold}% full
                      </Label>
                      <Slider
                        value={[config.storageFullThreshold]}
                        onValueChange={([value]) => updateConfig({ storageFullThreshold: value })}
                        min={50}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timing">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <IconClock className="size-4" />
                  Timing Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <Label>Check Interval (seconds)</Label>
                  <p className="text-xs text-muted-foreground">
                    How often to check for notifications. Lower values increase server load.
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.checkInterval]}
                      onValueChange={([value]) => updateConfig({ checkInterval: value })}
                      min={30}
                      max={300}
                      step={15}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.checkInterval}
                      onChange={(e) => updateConfig({ checkInterval: parseInt(e.target.value) || 60 })}
                      className="w-20"
                      min={30}
                      max={300}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Notification Cooldown (seconds)</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimum time between repeated notifications for the same event
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[config.notificationCooldown]}
                      onValueChange={([value]) => updateConfig({ notificationCooldown: value })}
                      min={60}
                      max={3600}
                      step={60}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={config.notificationCooldown}
                      onChange={(e) => updateConfig({ notificationCooldown: parseInt(e.target.value) || 300 })}
                      className="w-20"
                      min={60}
                      max={3600}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={sendTestNotification}
              disabled={notificationPermission !== 'granted'}
              className="gap-2 w-full sm:w-auto"
            >
              <IconBell className="size-4" />
              Send Test
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={saveConfig} disabled={saving} className="flex-1 sm:flex-none">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </>
      )}

      {!config.enabled && (
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <IconBellOff className="size-12 mx-auto mb-4 opacity-50" />
            <p>Enable notifications to configure alerts for this room</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveConfig} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function RoomNotificationsDialog({ roomName, playerName, serverUrl, children }: RoomNotificationsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Room Notifications</DrawerTitle>
            <DrawerDescription>
              Configure custom alerts for room events
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
            <NotificationForm
              roomName={roomName}
              playerName={playerName}
              serverUrl={serverUrl}
              onClose={() => setOpen(false)}
            >
              {children}
            </NotificationForm>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Room Notifications</DialogTitle>
          <DialogDescription>
            Configure custom alerts for room events and conditions
          </DialogDescription>
        </DialogHeader>
        <NotificationForm
          roomName={roomName}
          playerName={playerName}
          serverUrl={serverUrl}
          onClose={() => setOpen(false)}
        >
          {children}
        </NotificationForm>
      </DialogContent>
    </Dialog>
  )
}
