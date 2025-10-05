"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getServerSettings } from "@/lib/screeps-api"
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconTrash } from "@tabler/icons-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export function GlobalSay() {
  const [text, setText] = useState("")
  const [delay, setDelay] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [totalLines, setTotalLines] = useState(0)
  const pausedRef = useRef(false)
  const stoppedRef = useRef(false)

  const executeCommand = useCallback(async (command: string) => {
    try {
      const settings = getServerSettings()
      const response = await fetch('/api/screeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'console-command',
          settings,
          params: { command }
        }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to execute command")
      }
      return result.data?.result || ""
    } catch (error) {
      toast.error("Command failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
      return null
    }
  }, [])

  const waitForMessageComplete = useCallback(async (settings: ReturnType<typeof getServerSettings>) => {
    const maxAttempts = 100
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('/api/screeps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'console-command',
            settings,
            params: { command: 'Memory.globalMessageComplete' }
          }),
        })

        const result = await response.json()
        if (result.success && result.data?.result === "true") {
          return true
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      } catch (error) {
        console.error('Failed to check message completion:', error)
        return false
      }
    }
    
    return false
  }, [])

  const handleStart = useCallback(async () => {
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      toast.error("No text to send")
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    setTotalLines(lines.length)
    stoppedRef.current = false
    pausedRef.current = false
    
    const settings = getServerSettings()
    const startIndex = currentLine > 0 ? currentLine : 0
    
    for (let i = startIndex; i < lines.length; i++) {
      if (stoppedRef.current) break
      
      while (pausedRef.current && !stoppedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      if (stoppedRef.current) break
      
      setCurrentLine(i + 1)
      const line = lines[i].trim()
      
      const command = `globalSay("${line.replace(/"/g, '\\"')}")`
      const result = await executeCommand(command)
      
      if (result === null) {
        setIsRunning(false)
        setCurrentLine(0)
        return
      }
      
      toast.info(`Message ${i + 1}/${lines.length}`, {
        description: result
      })
      
      const completed = await waitForMessageComplete(settings)
      
      if (!completed) {
        toast.warning("Message completion timeout", {
          description: "Continuing to next message..."
        })
      }
      
      if (i < lines.length - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    if (!stoppedRef.current) {
      await executeCommand('globalSayClear()')
      toast.success("Global Say completed", {
        description: `Sent ${lines.length} messages and cleared`
      })
    }
    
    setIsRunning(false)
    setIsPaused(false)
    setCurrentLine(0)
  }, [text, delay, currentLine, executeCommand, waitForMessageComplete])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    pausedRef.current = true
  }, [])

  const handleResume = useCallback(() => {
    setIsPaused(false)
    pausedRef.current = false
  }, [])

  const handleStop = useCallback(async () => {
    stoppedRef.current = true
    setIsRunning(false)
    setIsPaused(false)
    setCurrentLine(0)
    
    await executeCommand('globalSayClear()')
    toast.info("Stopped and cleared")
  }, [executeCommand])

  const handleClear = useCallback(async () => {
    await executeCommand('globalSayClear()')
    toast.success("Global Say cleared")
  }, [executeCommand])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Global Say</h2>
        <p className="text-muted-foreground">Broadcast messages to the game console line by line</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Text</CardTitle>
            <CardDescription>Enter each message on a new line. Empty lines will be skipped.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="We're winning this game!&#10;Great teamwork everyone!&#10;Keep up the excellent progress!"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              disabled={isRunning}
              className="min-h-[400px] font-mono"
            />
            {totalLines > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Progress: {currentLine} / {totalLines} lines
                {isRunning && (
                  <span className="ml-2">
                    {isPaused ? "⏸️ Paused" : "▶️ Running"}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Configure and execute your broadcast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="delay">Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                disabled={isRunning}
                min={0}
                step={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Additional delay between messages (0 = immediate next message)
              </p>
            </div>

            <div className="space-y-2 pt-4">
              {!isRunning ? (
                <Button 
                  onClick={handleStart} 
                  className="w-full"
                  disabled={!text.trim()}
                >
                  <IconPlayerPlay className="size-4" />
                  Start
                </Button>
              ) : isPaused ? (
                <Button 
                  onClick={handleResume} 
                  className="w-full"
                >
                  <IconPlayerPlay className="size-4" />
                  Resume
                </Button>
              ) : (
                <Button 
                  onClick={handlePause} 
                  variant="secondary"
                  className="w-full"
                >
                  <IconPlayerPause className="size-4" />
                  Pause
                </Button>
              )}

              <Button 
                onClick={handleStop} 
                variant="destructive"
                className="w-full"
                disabled={!isRunning}
              >
                <IconPlayerStop className="size-4" />
                Stop & Clear
              </Button>

              <Button 
                onClick={handleClear} 
                variant="outline"
                className="w-full"
                disabled={isRunning}
              >
                <IconTrash className="size-4" />
                Clear Console
              </Button>
            </div>

            <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Each line sends: globalSay(text)</li>
                <li>Waits for Memory.globalMessageComplete = true</li>
                <li>Shows tick count and completion status</li>
                <li>Adds your delay after completion</li>
                <li>Automatically clears at the end</li>
                <li>Can pause/resume during execution</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
