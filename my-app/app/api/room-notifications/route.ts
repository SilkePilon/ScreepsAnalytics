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
