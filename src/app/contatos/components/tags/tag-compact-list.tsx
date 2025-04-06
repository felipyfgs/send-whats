"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { TagItem } from "./tag-components"
import { Tag } from "../types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Este componente exibe tags com um design mais compacto e limpo
// Ideal para mostrar categorias como "Cliente", "Carros", "Fornecedor", etc.

interface TagCompactListProps {
  tags: Tag[]
  selectedIds?: string[]
  onSelectTag?: (id: string) => void
  onEditTag?: (tag: Tag) => void
  onDeleteTag?: (id: string) => void
  showActions?: boolean
  className?: string
  limitTags?: number
  /**
   * Número máximo de tags visíveis quando não expandido
   * @default 2
   */
}

export function TagCompactList({
  tags,
  selectedIds = [],
  onSelectTag,
  onEditTag,
  onDeleteTag,
  showActions = false,
  className,
  limitTags
}: TagCompactListProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!tags || tags.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        Nenhuma tag encontrada
      </div>
    )
  }
  
  // Determinar quais tags serão visíveis
  const displayLimit = limitTags ?? 2
  const visibleTags = expanded ? tags : tags.slice(0, displayLimit)
  
  // Número de tags ocultas
  const hiddenCount = Math.max(0, tags.length - displayLimit)
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visibleTags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
          isAssigned={selectedIds.includes(tag.id)}
          isCompact={true}
          onToggle={onSelectTag ? (tagId) => onSelectTag(tagId) : undefined}
          onEdit={onEditTag ? (tag) => onEditTag(tag) : undefined}
          onDelete={onDeleteTag ? (tagId) => onDeleteTag(tagId) : undefined}
          showActions={showActions}
        />
      ))}
      
      {hiddenCount > 0 && !expanded && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs rounded-full hover:bg-muted hover:text-primary"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCount} {hiddenCount === 1 ? 'tag' : 'tags'}
        </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mostrar todas as tags</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {expanded && limitTags && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50"
          onClick={() => setExpanded(false)}
        >
          Mostrar menos
        </Button>
      )}
    </div>
  )
}
