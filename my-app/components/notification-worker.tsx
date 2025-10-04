'use client'

import { useEffect, useState } from 'react'
import { useRoomNotificationWorker } from '@/hooks/use-room-notifications'

interface NotificationWorkerProps {
  playerName: string | null
  serverUrl: string | null
}

export function NotificationWorker({ playerName, serverUrl }: NotificationWorkerProps) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const checkEnabled = () => {
      const hasPermission = typeof window !== 'undefined' && 
        'Notification' in window && 
        Notification.permission === 'granted'
      
      const hasPlayer = Boolean(playerName && serverUrl)
      
      setEnabled(hasPermission && hasPlayer)
    }

    checkEnabled()

    const interval = setInterval(checkEnabled, 5000)

    return () => clearInterval(interval)
  }, [playerName, serverUrl])

  useRoomNotificationWorker(enabled, playerName || '', serverUrl || '')

  return null
}
