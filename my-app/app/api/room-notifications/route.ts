import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, playerName, serverUrl, roomName, config } = body

    if (!playerName || !serverUrl || !roomName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (action === 'get') {
      const { data, error } = await supabase
        .from('room_notifications')
        .select('*')
        .eq('player_name', playerName)
        .eq('server_url', serverUrl)
        .eq('room_name', roomName)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification config:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ config: null })
      }

      const transformedConfig = {
        enabled: data.enabled,
        controllerUpgradeEnabled: data.controller_upgrade_enabled,
        controllerDowngradeEnabled: data.controller_downgrade_enabled,
        energyLowEnabled: data.energy_low_enabled,
        energyLowThreshold: data.energy_low_threshold,
        energyCriticalEnabled: data.energy_critical_enabled,
        energyCriticalThreshold: data.energy_critical_threshold,
        hostileCreepsEnabled: data.hostile_creeps_enabled,
        hostileCreepsThreshold: data.hostile_creeps_threshold,
        towerLowEnergyEnabled: data.tower_low_energy_enabled,
        towerLowEnergyThreshold: data.tower_low_energy_threshold,
        spawnIdleEnabled: data.spawn_idle_enabled,
        storageFullEnabled: data.storage_full_enabled,
        storageFullThreshold: data.storage_full_threshold,
        rampartLowHitsEnabled: data.rampart_low_hits_enabled,
        rampartLowHitsThreshold: data.rampart_low_hits_threshold,
        wallLowHitsEnabled: data.wall_low_hits_enabled,
        wallLowHitsThreshold: data.wall_low_hits_threshold,
        checkInterval: data.check_interval,
        notificationCooldown: data.notification_cooldown
      }

      return NextResponse.json({ config: transformedConfig })
    }

    if (action === 'save') {
      if (!config) {
        return NextResponse.json(
          { error: 'Config is required' },
          { status: 400 }
        )
      }

      const dbConfig = {
        player_name: playerName,
        server_url: serverUrl,
        room_name: roomName,
        enabled: config.enabled,
        controller_upgrade_enabled: config.controllerUpgradeEnabled,
        controller_downgrade_enabled: config.controllerDowngradeEnabled,
        energy_low_enabled: config.energyLowEnabled,
        energy_low_threshold: config.energyLowThreshold,
        energy_critical_enabled: config.energyCriticalEnabled,
        energy_critical_threshold: config.energyCriticalThreshold,
        hostile_creeps_enabled: config.hostileCreepsEnabled,
        hostile_creeps_threshold: config.hostileCreepsThreshold,
        tower_low_energy_enabled: config.towerLowEnergyEnabled,
        tower_low_energy_threshold: config.towerLowEnergyThreshold,
        spawn_idle_enabled: config.spawnIdleEnabled,
        storage_full_enabled: config.storageFullEnabled,
        storage_full_threshold: config.storageFullThreshold,
        rampart_low_hits_enabled: config.rampartLowHitsEnabled,
        rampart_low_hits_threshold: config.rampartLowHitsThreshold,
        wall_low_hits_enabled: config.wallLowHitsEnabled,
        wall_low_hits_threshold: config.wallLowHitsThreshold,
        check_interval: config.checkInterval,
        notification_cooldown: config.notificationCooldown,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('room_notifications')
        .upsert(dbConfig, {
          onConflict: 'player_name,server_url,room_name'
        })
        .select()

      if (error) {
        console.error('Error saving notification config:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    if (action === 'check-all') {
      const { data: configs, error: configError } = await supabase
        .from('room_notifications')
        .select('*')
        .eq('player_name', playerName)
        .eq('enabled', true)

      if (configError) {
        console.error('Error fetching notification configs:', configError)
        return NextResponse.json({ error: configError.message }, { status: 500 })
      }

      if (!configs || configs.length === 0) {
        return NextResponse.json({ notifications: [] })
      }

      const notifications: Array<{
        roomName: string
        serverUrl: string
        eventType: string
        message: string
        priority: 'normal' | 'high' | 'critical'
        requireInteraction: boolean
        timestamp: number
      }> = []

      for (const config of configs) {
        const now = Date.now()
        const cooldownMs = (config.notification_cooldown || 300) * 1000
        const lastNotified = config.last_notification_time ? new Date(config.last_notification_time).getTime() : 0

        if (now - lastNotified < cooldownMs) {
          continue
        }

        try {
          const roomResponse = await fetch(`${config.server_url}/api/game/room-objects?room=${config.room_name}`, {
            headers: { 'Accept': 'application/json' }
          })

          if (!roomResponse.ok) continue

          const roomData = await roomResponse.json()
          const objects = roomData.objects || []

          const controller = objects.find((obj: any) => obj.type === 'controller')
          const spawns = objects.filter((obj: any) => obj.type === 'spawn')
          const towers = objects.filter((obj: any) => obj.type === 'tower')
          const storage = objects.find((obj: any) => obj.type === 'storage')
          const hostileCreeps = objects.filter((obj: any) => obj.type === 'creep' && !obj.my)
          const ramparts = objects.filter((obj: any) => obj.type === 'rampart')
          const walls = objects.filter((obj: any) => obj.type === 'constructedWall')

          if (config.controller_downgrade_enabled && controller?.level && controller.downgradeTime) {
            const ticksToDowngrade = controller.downgradeTime - (roomData.gameTime || 0)
            const hoursToDowngrade = (ticksToDowngrade * 3) / 3600

            if (hoursToDowngrade < 24 && hoursToDowngrade > 0) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'controller_downgrade',
                message: `Controller in ${config.room_name} will downgrade in ${hoursToDowngrade.toFixed(1)}h`,
                priority: hoursToDowngrade < 12 ? 'critical' : 'high',
                requireInteraction: hoursToDowngrade < 12,
                timestamp: now
              })
            }
          }

          if (config.energy_critical_enabled) {
            const totalEnergy = objects
              .filter((obj: any) => obj.type === 'extension' || obj.type === 'spawn')
              .reduce((sum: number, obj: any) => sum + (obj.store?.energy || 0), 0)

            if (totalEnergy < config.energy_critical_threshold) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'energy_critical',
                message: `Energy critical in ${config.room_name}: ${totalEnergy}/${config.energy_critical_threshold}`,
                priority: 'critical',
                requireInteraction: true,
                timestamp: now
              })
            }
          }

          if (config.energy_low_enabled) {
            const totalEnergy = objects
              .filter((obj: any) => obj.type === 'extension' || obj.type === 'spawn')
              .reduce((sum: number, obj: any) => sum + (obj.store?.energy || 0), 0)

            if (totalEnergy < config.energy_low_threshold && totalEnergy >= (config.energy_critical_threshold || 0)) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'energy_low',
                message: `Energy low in ${config.room_name}: ${totalEnergy}/${config.energy_low_threshold}`,
                priority: 'high',
                requireInteraction: false,
                timestamp: now
              })
            }
          }

          if (config.hostile_creeps_enabled && hostileCreeps.length >= config.hostile_creeps_threshold) {
            notifications.push({
              roomName: config.room_name,
              serverUrl: config.server_url,
              eventType: 'hostile_creeps',
              message: `${hostileCreeps.length} hostile creeps in ${config.room_name}`,
              priority: 'critical',
              requireInteraction: true,
              timestamp: now
            })
          }

          if (config.tower_low_energy_enabled) {
            const lowTowers = towers.filter((tower: any) => 
              (tower.store?.energy || 0) < config.tower_low_energy_threshold
            )

            if (lowTowers.length > 0) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'tower_low_energy',
                message: `${lowTowers.length} tower(s) low on energy in ${config.room_name}`,
                priority: 'high',
                requireInteraction: false,
                timestamp: now
              })
            }
          }

          if (config.spawn_idle_enabled) {
            const idleSpawns = spawns.filter((spawn: any) => !spawn.spawning)

            if (idleSpawns.length === spawns.length && spawns.length > 0) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'spawn_idle',
                message: `All spawns idle in ${config.room_name}`,
                priority: 'normal',
                requireInteraction: false,
                timestamp: now
              })
            }
          }

          if (config.storage_full_enabled && storage) {
            const storageCapacity = storage.storeCapacity || 1000000
            const storageUsed = storage.store?.energy || 0
            const usedPercentage = (storageUsed / storageCapacity) * 100

            if (usedPercentage >= config.storage_full_threshold) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'storage_full',
                message: `Storage ${usedPercentage.toFixed(0)}% full in ${config.room_name}`,
                priority: 'normal',
                requireInteraction: false,
                timestamp: now
              })
            }
          }

          if (config.rampart_low_hits_enabled) {
            const lowRamparts = ramparts.filter((rampart: any) => 
              (rampart.hits || 0) < config.rampart_low_hits_threshold
            )

            if (lowRamparts.length > 0) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'rampart_low_hits',
                message: `${lowRamparts.length} rampart(s) low on hits in ${config.room_name}`,
                priority: 'high',
                requireInteraction: false,
                timestamp: now
              })
            }
          }

          if (config.wall_low_hits_enabled) {
            const lowWalls = walls.filter((wall: any) => 
              (wall.hits || 0) < config.wall_low_hits_threshold
            )

            if (lowWalls.length > 0) {
              notifications.push({
                roomName: config.room_name,
                serverUrl: config.server_url,
                eventType: 'wall_low_hits',
                message: `${lowWalls.length} wall(s) low on hits in ${config.room_name}`,
                priority: 'high',
                requireInteraction: false,
                timestamp: now
              })
            }
          }
        } catch (error) {
          console.error(`Error checking room ${config.room_name}:`, error)
        }
      }

      if (notifications.length > 0) {
        const roomsToUpdate = [...new Set(notifications.map(n => n.roomName))]
        
        for (const room of roomsToUpdate) {
          await supabase
            .from('room_notifications')
            .update({ 
              last_notification_time: new Date().toISOString(),
              last_check_time: new Date().toISOString()
            })
            .eq('player_name', playerName)
            .eq('room_name', room)
        }
      }

      return NextResponse.json({ notifications })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Room notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
