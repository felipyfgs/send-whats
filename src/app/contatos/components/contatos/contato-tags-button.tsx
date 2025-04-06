"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TagIcon } from "lucide-react"
import { TagsButton } from "../tags/tags"

interface ContatoTagsButtonProps {
  contatoId: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ContatoTagsButton({
  contatoId,
  variant = "outline",
  size = "sm",
  className
}: ContatoTagsButtonProps) {
  return (
    <TagsButton
      contatoIds={[contatoId]}
      variant={variant}
      size={size}
      className={className}
    >
      <TagIcon className="h-4 w-4 mr-2" />
      Gerenciar Tags
    </TagsButton>
  )
} 