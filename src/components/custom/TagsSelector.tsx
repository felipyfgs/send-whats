"use client"

import * as React from "react"
import { X, ChevronsUpDown, TagIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Tag } from "@/app/contatos/components/types"

interface TagsSelectorProps {
  tags: Tag[]
  selectedTags: Tag[]
  limitTags?: number
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  width?: string
  onChange?: (selectedTags: Tag[]) => void
  className?: string
}

export function TagsSelector({
  tags,
  selectedTags,
  limitTags = 2,
  placeholder = "Selecionar tags...",
  searchPlaceholder = "Buscar tags...",
  emptyMessage = "Nenhuma tag encontrada.",
  width = "100%",
  onChange,
  className,
}: TagsSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [didSelection, setDidSelection] = React.useState(false)

  // Log quando as props mudam
  React.useEffect(() => {
  }, [selectedTags]);

  // Efeito para manter o popover aberto após uma seleção
  React.useEffect(() => {
    if (didSelection) {
      setDidSelection(false)
      setOpen(true)
    }
  }, [didSelection])

  // Filtra as tags com base no termo de busca
  const filteredTags = React.useMemo(() => {
    // Verificação de segurança para garantir que tags é um array
    if (!tags || !Array.isArray(tags)) {
      return []
    }
    
    if (!searchTerm) return tags
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tags, searchTerm])

  // Adiciona ou remove uma tag da seleção
  const toggleTag = React.useCallback((tag: Tag) => {
    if (!onChange) return;

    const isSelected = selectedTags.some(t => t.id === tag.id)
    
    if (isSelected) {
      const newTags = selectedTags.filter(t => t.id !== tag.id);
      onChange(newTags);
    } else {
      const newTags = [...selectedTags, tag];
      onChange(newTags);
    }
    
    // Sinaliza que uma seleção foi feita para manter o menu aberto
    setDidSelection(true)
  }, [selectedTags, onChange]);

  // Remove uma tag da seleção
  const removeTag = React.useCallback((tag: Tag, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (onChange) {
      onChange(selectedTags.filter(t => t.id !== tag.id))
    }
  }, [selectedTags, onChange])

  // Renderiza as tags limitadas
  const renderTags = () => {
    if (selectedTags.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    // Exibe apenas as primeiras 'limitTags' seleções, com contador para o restante
    const visibleTags = selectedTags.slice(0, limitTags)
    const remainingCount = selectedTags.length - limitTags

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {visibleTags.map((tag) => (
          <Badge 
            key={tag.id} 
            variant="secondary" 
            className="flex items-center gap-1"
            style={{ 
              backgroundColor: tag.color,
              color: getTextColor(tag.color) 
            }}
          >
            {tag.name}
            <X 
              className="h-3 w-3 cursor-pointer"
              onClick={(e) => removeTag(tag, e)} 
            />
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline">+{remainingCount}</Badge>
        )}
      </div>
    )
  }

  // Calculando cor de texto para melhor contraste
  const getTextColor = (bgColor: string) => {
    // Conversão hex para RGB
    const r = parseInt(bgColor.slice(1, 3), 16)
    const g = parseInt(bgColor.slice(3, 5), 16)
    const b = parseInt(bgColor.slice(5, 7), 16)
    
    // Fórmula de luminância relativa
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Retorna branco para cores escuras, e preto para cores claras
    return luminance > 0.65 ? "#000000" : "#FFFFFF"
  }

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        // Só permitimos fechamento pelo botão trigger, não ao selecionar itens
        if (!didSelection) {
          setOpen(newOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-h-10 h-auto py-2 justify-between text-left font-normal w-full",
            className
          )}
          onClick={(e) => setOpen(!open)}
        >
          <div className="flex-1 truncate">
            {renderTags()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-full" 
        style={{ maxWidth: width }}
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.some(t => t.id === tag.id)
                  
                  return (
                    <div key={tag.id} className="relative">
                      <CommandItem
                        value={tag.name}
                        onSelect={() => {
                          toggleTag(tag);
                        }}
                        className={cn(
                          "flex items-center gap-2 py-3 cursor-pointer",
                          isSelected ? "bg-accent font-medium" : ""
                        )}
                      >
                        <div 
                          className="mr-2 h-4 w-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1">{tag.name}</span>
                        {isSelected && (
                          <div className="flex items-center justify-center">
                            <svg 
                              className="h-4 w-4 text-primary" 
                              fill="none" 
                              strokeWidth="2.5" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        )}
                      </CommandItem>
                    </div>
                  )
                })
              ) : (
                <div className="py-6 text-center text-sm">
                  {tags && Array.isArray(tags) && tags.length > 0 
                    ? (searchTerm 
                        ? `Nenhuma tag encontrada com "${searchTerm}"` 
                        : "Nenhuma tag disponível para exibição")
                    : "Nenhuma tag carregada do banco de dados"
                  }
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 