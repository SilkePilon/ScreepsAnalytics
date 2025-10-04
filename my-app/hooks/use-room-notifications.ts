"use client"

import { useEffect, useRef } from "react"

interface RoomNotificationData {
  roomName: string
  serverUrl: string
  eventType: string
  message: string
  priority: 'normal' | 'high' | 'critical'
  requireInteraction: boolean
  timestamp: number
}

export function useRoomNotificationWorker(enabled: boolean, playerName: string, serverUrl: string) {
  const workerRef = useRef<number | null>(null)
  const lastChecksRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    if (!enabled || !playerName || !serverUrl || typeof window === 'undefined') return

    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/room-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check-all',
            playerName,
            serverUrl,
            roomName: ''
          })
        })

        if (!response.ok) return

        const data = await response.json()
        const notifications: RoomNotificationData[] = data.notifications || []

        for (const notif of notifications) {
          const key = `${notif.roomName}-${notif.eventType}`
          const lastCheck = lastChecksRef.current.get(key) || 0
          
          if (notif.timestamp > lastCheck) {
            if (Notification.permission === 'granted') {
              new Notification(`Screeps - ${notif.roomName}`, {
                body: notif.message,
                icon: '/favicon.ico',
                tag: key,
                requireInteraction: notif.requireInteraction
              })
            }
            lastChecksRef.current.set(key, notif.timestamp)
          }
        }
      } catch (error) {
        console.error('Notification check error:', error)
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 60000)
    workerRef.current = interval as unknown as number

    return () => {
      if (workerRef.current) {
        clearInterval(workerRef.current)
      }
    }
  }, [enabled, playerName, serverUrl])
}
