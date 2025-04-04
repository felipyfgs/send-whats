"use client"

import { useState, useCallback, memo } from "react"
import { Tag } from "../components/columns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckIcon, SearchIcon, TagIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagSelectorProps {
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (selectedIds: string[]) => void
}

// Usando memo para evitar re-renders desnecessários
const TagItem = memo(({ 
  tag, 
  isSelected, 
  onToggle 
}: { 
  tag: Tag, 
  isSelected: boolean, 
  onToggle: () => void 
}) => (
  <div
    key={tag.id}
    className={cn(
      "flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors",
      isSelected && "bg-muted/50"
    )}
    onClick={onToggle}
  >
    <Checkbox
      checked={isSelected}
      onCheckedChange={onToggle}
      id={`tag-${tag.id}`}
    />
    <Badge 
      style={{ backgroundColor: tag.cor }} 
      className="text-white"
    >
      {tag.nome}
    </Badge>
    {isSelected && (
      <CheckIcon className="h-4 w-4 ml-auto text-primary" />
    )}
  </div>
))

TagItem.displayName = "TagItem"

export function TagSelector({ tags, selectedTagIds, onChange }: TagSelectorProps) {
  const [filter, setFilter] = useState("")
  
  const filteredTags = tags.filter(tag => 
    tag.nome.toLowerCase().includes(filter.toLowerCase())
  )
  
  const handleToggleTag = useCallback((tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }, [selectedTagIds, onChange])
  
  const handleClearFilter = useCallback(() => {
    setFilter("")
  }, [])

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar tags..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 pr-8"
          aria-label="Filtrar tags"
        />
        {filter && (
          <button 
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClearFilter}
            aria-label="Limpar filtro"
          >
            ×
          </button>
        )}
      </div>
      
      {filteredTags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
          <TagIcon className="h-6 w-6" />
          {filter ? (
            <p>Nenhuma tag encontrada com "{filter}".</p>
          ) : (
            <p>Nenhuma tag disponível.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {filteredTags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              isSelected={selectedTagIds.includes(tag.id)}
              onToggle={() => handleToggleTag(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
} 