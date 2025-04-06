"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export type OptionType = {
  value: string
  label: string
  [key: string]: any // Para permitir outras propriedades, como cor, ícone, etc.
}

interface MultiSelectProps {
  options: OptionType[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  maxHeight?: number
  disabled?: boolean
  className?: string
  renderOption?: (option: OptionType, isSelected: boolean) => React.ReactNode
  renderBadge?: (option: OptionType) => React.ReactNode
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Selecione itens...",
  emptyText = "Nenhum item encontrado.",
  searchPlaceholder = "Pesquisar...",
  maxHeight = 200,
  disabled = false,
  className = "",
  renderOption,
  renderBadge,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  
  // Obter opções selecionadas completas (com todos os dados)
  const selectedOptions = options.filter(option => 
    selected.includes(option.value)
  )
  
  // Adicionar um item à seleção
  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value)
    
    if (isSelected) {
      onChange(selected.filter(item => item !== value))
    } else {
      onChange([...selected, value])
    }
  }
  
  // Remover um item da seleção
  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value))
  }
  
  // Renderização padrão de opções
  const defaultRenderOption = (option: OptionType, isSelected: boolean) => (
    <CommandItem
      key={option.value}
      value={option.value}
      onSelect={() => handleSelect(option.value)}
      className="flex items-center gap-2"
    >
      <Check
        className={cn(
          "h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span>{option.label}</span>
    </CommandItem>
  )
  
  // Renderização padrão de badges
  const defaultRenderBadge = (option: OptionType) => (
    <Badge 
      key={option.value} 
      variant="outline"
      className="group flex items-center gap-1"
    >
      {option.label}
      <button
        type="button"
        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleRemove(option.value)
        }}
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </button>
    </Badge>
  )
  
  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", 
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            {selected.length > 0 
              ? `${selected.length} ${selected.length === 1 ? 'item selecionado' : 'itens selecionados'}`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[200px]" align="start">
          <Command className="w-full">
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandList>
              <ScrollArea className="h-[200px]">
                <CommandGroup>
                  {options.map(option => (
                    renderOption ? 
                      renderOption(option, selected.includes(option.value)) :
                      defaultRenderOption(option, selected.includes(option.value))
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Exibir items selecionados como badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.map(option => (
            renderBadge ? 
              renderBadge(option) : 
              defaultRenderBadge(option)
          ))}
        </div>
      )}
    </div>
  )
} 