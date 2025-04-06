"use client"

import React, { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  MoreHorizontal, 
  X, 
  Settings, 
  Pencil, 
  Trash2,
  CheckCircle
} from "lucide-react"
import { Tag } from "../types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Componente TagItem para seleção e gestão de tags
export interface TagItemProps {
  tag: Tag
  isAssigned?: boolean
  isPartial?: boolean
  isCompact?: boolean
  onToggle?: (tagId: string, assigned: boolean) => void
  onEdit?: (tag: Tag) => void
  onDelete?: (tagId: string) => void
  showActions?: boolean
}

export const TagItem = React.memo(({ 
  tag, 
  isAssigned = false, 
  isPartial = false, 
  isCompact = false,
  onToggle,
  onEdit,
  onDelete,
  showActions = false
}: TagItemProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleEditClick = useCallback(() => {
    if (onEdit) {
      onEdit(tag)
    }
  }, [onEdit, tag])

  const handleDeleteClick = useCallback(() => {
    setShowDeleteAlert(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (onDelete) {
      onDelete(tag.id)
    }
    setShowDeleteAlert(false)
  }, [onDelete, tag.id])

  const handleTagClick = useCallback((e: React.MouseEvent) => {
    // Impedir qualquer comportamento padrão e propagação
    e.preventDefault();
    e.stopPropagation();
    
    // Usar requestAnimationFrame para atrasar a ação e evitar conflitos com outros handlers
    requestAnimationFrame(() => {
      if (onToggle) {
        onToggle(tag.id, !isAssigned);
      }
    });
    
    // Prevenir que outros handlers sejam chamados
    return false;
  }, [onToggle, tag.id, isAssigned]);

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
    <>
      <div className={cn(
        "relative group",
        isCompact ? "inline-flex items-center" : "inline-block"
      )}>
        <Badge
          onClick={handleTagClick}
          style={{ 
            backgroundColor: tag.color,
            color: getTextColor(tag.color),
            borderColor: isPartial ? 'rgba(255,255,255,0.3)' : 'transparent',
            borderWidth: isPartial ? '1px' : '0',
            borderStyle: isPartial ? 'dashed' : 'solid',
            boxShadow: isCompact ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
          }}
          className={cn(
            "cursor-pointer transition-all duration-200",
            isCompact 
              ? "py-1 px-2.5 h-auto text-xs flex items-center hover:translate-y-[-1px]"
              : "py-1.5 px-3 h-auto flex items-center gap-1 min-w-[80px] justify-between hover:translate-y-[-2px] hover:shadow-md",
            isAssigned 
              ? isCompact 
                ? "ring-1 ring-offset-1 ring-offset-background ring-primary/60" 
                : "ring-2 ring-offset-1 ring-offset-background ring-primary/60"
              : isCompact 
                ? "opacity-90 hover:opacity-100" 
                : "opacity-80 hover:opacity-100",
            isPartial && "bg-opacity-70"
          )}
        >
          <span className="font-medium">{tag.name}</span>
          {isAssigned && onToggle && (
            <X className={cn(
              "opacity-70 group-hover:opacity-100 hover:text-destructive transition-colors",
              isCompact ? "ml-1.5 h-3 w-3" : "h-3.5 w-3.5"
            )} />
          )}
          {!isAssigned && onToggle && !isCompact && (
            <span className="h-3.5 w-3.5 text-xs opacity-60 group-hover:opacity-100">+</span>
          )}
        </Badge>
        
        {showActions && !isCompact && (
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-5 w-5 rounded-full shadow-sm">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {showActions && isCompact && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <MoreHorizontal className="h-3 w-3" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {onEdit && (
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tag "{tag.name}" será removida
              permanentemente e desvinculada de todos os contatos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
});

TagItem.displayName = "TagItem";

// TagActions para dropdown menu de ações
export interface TagActionsProps {
  tag: Tag
  onEdit?: (tag: Tag) => void
  onDelete?: (id: string) => void
  minimal?: boolean
}

export const TagActions = React.memo(
  ({ tag, onEdit, onDelete, minimal = false }: TagActionsProps) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              minimal ? "h-5 w-5" : "h-8 w-8",
              "hover:bg-muted/80 transition-colors"
            )}
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className={minimal ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={minimal ? "w-32" : "w-44"}>
          {!minimal && <DropdownMenuLabel>Ações</DropdownMenuLabel>}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(tag)} className="gap-2">
              {!minimal && <Pencil className="h-4 w-4" />}
              Editar {!minimal && "Tag"}
            </DropdownMenuItem>
          )}
          {!minimal && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(tag.id)}
              className="text-destructive focus:text-destructive gap-2"
            >
              {!minimal && <Trash2 className="h-4 w-4" />}
              Excluir {!minimal && "Tag"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
TagActions.displayName = "TagActions";

// TagCard para visualização em grid
export interface TagCardProps {
  tag: Tag
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit?: (tag: Tag) => void
  onDelete?: (id: string) => void
}

export const TagCard = React.memo(
  ({ tag, isSelected, onToggleSelect, onEdit, onDelete }: TagCardProps) => {
    const handleToggle = useCallback(() => {
      onToggleSelect(tag.id);
    }, [tag.id, onToggleSelect]);

    return (
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <div 
          className="h-3 w-full" 
          style={{ backgroundColor: tag.color }}
        />
        <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
          <h3 
            className="text-sm font-medium truncate cursor-pointer hover:underline"
            onClick={handleToggle}
          >
            {tag.name}
          </h3>
          <div className="flex items-center gap-1">
            {isSelected && (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
            <TagActions 
              tag={tag} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              minimal 
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div 
            className="text-xs text-muted-foreground cursor-pointer"
            onClick={handleToggle}
          >
            {tag.description || "Sem descrição"}
          </div>
        </CardContent>
      </Card>
    );
  }
);
TagCard.displayName = "TagCard";

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

// Componente simples para seleção de cores
interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded border"
      />
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  )
}
