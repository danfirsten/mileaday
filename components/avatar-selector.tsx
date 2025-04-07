"use client"

import { useState } from "react"
import { AVATAR_OPTIONS } from "@/lib/constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AvatarSelectorProps {
  currentAvatarId: string
  onSelect: (avatarId: string) => void
  disabled?: boolean
}

export function AvatarSelector({ currentAvatarId, onSelect, disabled }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentAvatar = AVATAR_OPTIONS.find(avatar => avatar.id === currentAvatarId) || AVATAR_OPTIONS[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80">
            <AvatarImage src={currentAvatar.url} alt={currentAvatar.label} />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" disabled={disabled}>
            Change Avatar
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-4 gap-4 py-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                className={`relative rounded-lg p-2 hover:bg-accent ${
                  currentAvatarId === avatar.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  onSelect(avatar.id)
                  setIsOpen(false)
                }}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar.url} alt={avatar.label} />
                  <AvatarFallback>{avatar.label}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  {avatar.label}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 