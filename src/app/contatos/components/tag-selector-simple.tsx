"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  nome: string
  cor: string
}

interface TagSelectorSimpleProps {
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (selectedIds: string[]) => void
  onCreateTag?: () => void
}

export function TagSelectorSimple({ 
  tags,
  selectedTagIds,
  onChange,
  onCreateTag
}: TagSelectorSimpleProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.cor }}
          className={cn(
            "cursor-pointer text-white",
            !selectedTagIds.includes(tag.id) && "opacity-60"
          )}
          onClick={() => toggleTag(tag.id)}
        >
          {tag.nome}
        </Badge>
      ))}
      
      {onCreateTag && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCreateTag}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Tag
        </Button>
      )}
    </div>
  )
}