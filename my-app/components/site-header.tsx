"use client"

import { IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SettingsDialog } from "@/components/settings-dialog"
import { ModeToggle } from "@/components/mode-toggle"

interface SiteHeaderProps {
  onRefresh?: () => void
}

export function SiteHeader({ onRefresh }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Screeps Analytics</h1>
        <div className="ml-auto flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              title="Refresh data"
            >
              <IconRefresh className="size-5" />
            </Button>
          )}
          <ModeToggle />
          <SettingsDialog />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/screeps/screeps"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Screeps
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
