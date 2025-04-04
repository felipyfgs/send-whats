"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type OptionType = {
  value: string
  label: string
  color?: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: OptionType[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  emptyMessage?: string
  maxDisplay?: number
  displayColors?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  className,
  emptyMessage = "Nenhuma opção encontrada.",
  maxDisplay = 3,
  displayColors = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter((option) => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const toggleOption = React.useCallback((value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }, [selected, onChange])

  const removeBadge = React.useCallback((value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }, [selected, onChange])

  // Obter opções selecionadas como objetos
  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value))
  }, [options, selected])

  // Preparar badges para exibição
  const displayedBadges = React.useMemo(() => {
    if (selectedOptions.length === 0) return []
    const displayBadges = selectedOptions.slice(0, maxDisplay)
    return displayBadges
  }, [selectedOptions, maxDisplay])

  // Badge contador para extras
  const extraBadgesCount = Math.max(0, selectedOptions.length - maxDisplay)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 px-3 py-2",
            selectedOptions.length > 0 ? "h-auto" : "",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {selectedOptions.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            
            {displayedBadges.map((option) => (
              <Badge 
                key={option.value} 
                className="mr-1 mb-1 h-6 px-2 py-0 leading-6"
                style={displayColors && option.color ? { backgroundColor: option.color } : {}}
              >
                {option.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => removeBadge(option.value, e)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            
            {extraBadgesCount > 0 && (
              <Badge variant="secondary" className="mb-1 h-6 px-2 py-0 leading-6">
                +{extraBadgesCount}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <div className="flex-1">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {searchQuery && (
              <X 
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "cursor-pointer",
                      isSelected ? "font-medium" : "font-normal",
                      option.disabled ? "cursor-not-allowed opacity-50" : ""
                    )}
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </div>
                    {displayColors && option.color && (
                      <div
                        className="mr-2 h-3 w-3 rounded-full" 
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 