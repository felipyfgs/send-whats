"use client"

import { useState } from "react"
import { Tag } from "../components/columns"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckIcon, SearchIcon } from "lucide-react"

interface TagSelectorProps {
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (selectedIds: string[]) => void
}

export function TagSelector({ tags, selectedTagIds, onChange }: TagSelectorProps) {
  const [filter, setFilter] = useState("")
  
  const filteredTags = tags.filter(tag => 
    tag.nome.toLowerCase().includes(filter.toLowerCase())
  )
  
  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }
  
  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar tags..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {filteredTags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma tag encontrada.
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
              onClick={() => handleToggleTag(tag.id)}
            >
              <Checkbox
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={() => handleToggleTag(tag.id)}
              />
              <Badge 
                style={{ backgroundColor: tag.cor }} 
                className="text-white"
              >
                {tag.nome}
              </Badge>
              {selectedTagIds.includes(tag.id) && (
                <CheckIcon className="h-4 w-4 ml-auto text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 