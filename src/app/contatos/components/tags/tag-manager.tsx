"use client"

import { useState, useEffect, useMemo } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Tag } from "../types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  SearchIcon, 
  X, 
  Save, 
  Pencil, 
  Trash2, 
  Settings, 
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TagFormDialog } from "./tag-form-dialog"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { TagTable } from "./tag-table"
import React from "react"

interface TagItemProps {
  tag: Tag
  isAssigned: boolean
  isPartial?: boolean
  onToggle: (tagId: string, assigned: boolean) => void
  onEdit?: (tag: Tag) => void
  onDelete?: (tagId: string) => void
  allowManage?: boolean
}

// Componente TagItem
const TagItem = React.memo(({ 
  tag, 
  isAssigned, 
  isPartial = false, 
  onToggle,
  onEdit,
  onDelete,
  allowManage = false
}: TagItemProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleEditClick = React.useCallback(() => {
    if (onEdit) {
      onEdit(tag)
    }
  }, [onEdit, tag])

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteAlert(true)
  }, [])

  const handleConfirmDelete = React.useCallback(() => {
    if (onDelete) {
      onDelete(tag.id)
    }
    setShowDeleteAlert(false)
  }, [onDelete, tag.id])

  const handleCheckChange = React.useCallback((checked: boolean) => {
    onToggle(tag.id, checked as boolean)
  }, [onToggle, tag.id])

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md border border-transparent transition-all hover:bg-muted/20 mb-1",
          isAssigned && "bg-muted/30",
          isPartial && "border-dashed border-muted-foreground/30"
        )}
      >
        <Checkbox
          id={`tag-${tag.id}`}
          checked={isAssigned}
          onCheckedChange={(checked) => handleCheckChange(checked as boolean)}
        />
        <Badge
          style={{ backgroundColor: tag.color }}
          className="text-white px-3 py-1"
        >
          {tag.name}
        </Badge>
        
        <span className={cn(
          "text-sm ml-auto",
          isPartial 
            ? "text-amber-500 dark:text-amber-400" 
            : isAssigned 
              ? "text-green-600 dark:text-green-500" 
              : "text-muted-foreground"
        )}>
          {isAssigned 
            ? isPartial 
              ? "Parcialmente atribuída" 
              : "Atribuída a todos" 
            : "Não atribuída"}
        </span>
        
        {allowManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
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

export function TagManager() {
  const { 
    tags,
    contatos, 
    selectedContatos, 
    addTagsToSelectedContatos, 
    removeTagsFromSelectedContatos,
    createTag,
    updateTag,
    deleteTag
  } = useContatos()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([])
  const [unassignedTagIds, setUnassignedTagIds] = useState<string[]>([])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [saving, setSaving] = useState(false)
  const [partialTagIds, setPartialTagIds] = useState<string[]>([])
  
  // Obter todas as tags dos contatos selecionados
  const selectedContatosData = useMemo(() => {
    return contatos.filter(contato => selectedContatos.includes(contato.id))
  }, [contatos, selectedContatos])
  
  // Determinar tags comuns a todos os contatos selecionados
  useEffect(() => {
    if (selectedContatosData.length === 0) return
    
    // Tags que todos os contatos têm em comum
    const commonTags = tags.filter(tag => 
      selectedContatosData.every(contato => 
        contato.tags.some(t => t.id === tag.id)
      )
    )
    
    // Tags que alguns contatos têm, mas não todos
    const partialTags = tags.filter(tag => 
      selectedContatosData.some(contato => 
        contato.tags.some(t => t.id === tag.id)
      ) && !commonTags.some(t => t.id === tag.id)
    )
    
    setAssignedTagIds(commonTags.map(tag => tag.id))
    
    // Tags que não estão em nenhum dos contatos selecionados
    const unusedTags = tags.filter(tag => 
      !commonTags.some(t => t.id === tag.id) && 
      !partialTags.some(t => t.id === tag.id)
    )
    
    setUnassignedTagIds(unusedTags.map(tag => tag.id))
    
    // Guardar as tags parciais para referência visual
    setPartialTagIds(partialTags.map(tag => tag.id))
  }, [selectedContatosData, tags])
  
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tags, searchTerm])
  
  // Gerenciar a alteração nos checkboxes
  const handleTagToggle = (tagId: string, isAssigned: boolean) => {
    const isPartialTag = partialTagIds.includes(tagId)
    
    if (isAssigned) {
      // Se a tag estiver sendo marcada
      if (isPartialTag) {
        // Se for uma tag parcial, remove da lista de parciais
        setPartialTagIds(prev => prev.filter(id => id !== tagId))
      }
      
      // Adicionar à lista de tags atribuídas
      if (!assignedTagIds.includes(tagId)) {
        setAssignedTagIds(prev => [...prev, tagId])
      }
      
      // Remover da lista de tags não atribuídas
      setUnassignedTagIds(prev => prev.filter(id => id !== tagId))
    } else {
      // Se a tag estiver sendo desmarcada
      // Remover da lista de tags atribuídas
      setAssignedTagIds(prev => prev.filter(id => id !== tagId))
      
      // Adicionar à lista de tags não atribuídas se ainda não estiver lá
      if (!unassignedTagIds.includes(tagId)) {
        setUnassignedTagIds(prev => [...prev, tagId])
      }
      
      // Se for uma tag parcial, remove da lista de parciais
      if (isPartialTag) {
        setPartialTagIds(prev => prev.filter(id => id !== tagId))
      }
    }
  }
  
  // Salvar alterações
  const handleSave = async () => {
    if (selectedContatos.length === 0) {
      toast.error("Nenhum contato selecionado")
      return
    }
    
    setSaving(true)
    
    try {
      // Obter todas as tags dos contatos antes da alteração
      const initialTagsByContato = new Map<string, Set<string>>()
      selectedContatosData.forEach(contato => {
        initialTagsByContato.set(
          contato.id, 
          new Set(contato.tags.map(tag => tag.id))
        )
      })
      
      // Tags para adicionar - as marcadas que não estavam originalmente em todos os contatos
      const tagsToAdd = assignedTagIds.filter(tagId => 
        selectedContatosData.some(contato => 
          !contato.tags.some(tag => tag.id === tagId)
        )
      )
      
      // Tags para remover - as não marcadas que estavam em algum contato
      const tagsToRemove = unassignedTagIds.filter(tagId => 
        selectedContatosData.some(contato => 
          contato.tags.some(tag => tag.id === tagId)
        )
      )
      
      // Processar tags para adicionar
      if (tagsToAdd.length > 0) {
        await addTagsToSelectedContatos(tagsToAdd)
      }
      
      // Processar tags para remover
      if (tagsToRemove.length > 0) {
        await removeTagsFromSelectedContatos(tagsToRemove)
      }
      
      // Mostrar mensagem de sucesso apropriada
      if (tagsToAdd.length > 0 || tagsToRemove.length > 0) {
        toast.success(`Tags atualizadas para ${selectedContatos.length} contato(s)`)
      } else {
        toast.info("Nenhuma alteração em tags foi detectada")
      }
    } catch (error) {
      console.error("Erro ao salvar tags:", error)
      toast.error("Erro ao salvar as alterações nas tags")
    } finally {
      setSaving(false)
    }
  }
  
  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
  }
  
  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      toast.success("Tag excluída com sucesso")
    } catch (error) {
      console.error("Erro ao excluir tag:", error)
      toast.error("Erro ao excluir a tag")
    }
  }
  
  // Rendering component without selected contacts
  if (selectedContatos.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Gerenciar Tags</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as tags do sistema
            </p>
          </div>
          <TagFormDialog
            onSave={(tagData) => {
              createTag(tagData)
            }}
          />
        </div>
        <TagTable />
      </div>
    )
  }
  
  // Renderizar o componente de atribuição de tags a contatos
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Tags</h2>
          <p className="text-sm text-muted-foreground">
            {selectedContatos.length === 1 
              ? `Gerenciando tags para 1 contato` 
              : `Gerenciando tags para ${selectedContatos.length} contatos`}
          </p>
        </div>
        <TagFormDialog
          onSave={(tagData) => {
            createTag(tagData)
          }}
        />
      </div>
      
      {selectedContatos.length > 1 && (
        <div className="bg-muted/30 rounded-lg p-3 text-sm border border-muted flex items-start gap-2 mb-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Gerenciando tags para múltiplos contatos</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Tags <span className="text-green-600 dark:text-green-500">atribuídas a todos</span> os contatos estão marcadas</li>
              <li>Tags <span className="text-amber-500 dark:text-amber-400">parcialmente atribuídas</span> estão presentes em alguns contatos, mas não todos</li>
              <li>Ao marcar uma tag, ela será adicionada a todos os contatos selecionados</li>
              <li>Ao desmarcar uma tag, ela será removida de todos os contatos selecionados</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="relative mb-3">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4"
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="h-[300px] overflow-y-auto pr-1 mt-2">
        {filteredTags.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhuma tag encontrada com este termo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tags atribuídas a todos os contatos */}
            {assignedTagIds.length > 0 && (
              <div className="bg-muted/10 rounded-lg pt-2 pb-1 px-1">
                <h3 className="text-sm font-medium text-primary mb-2 px-2">Atribuídas a todos</h3>
                {filteredTags
                  .filter(tag => assignedTagIds.includes(tag.id))
                  .map(tag => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      isAssigned={true}
                      onToggle={handleTagToggle}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                      allowManage={true}
                    />
                  ))}
              </div>
            )}
            
            {/* Tags parcialmente atribuídas */}
            {partialTagIds.length > 0 && (
              <div className="bg-muted/10 rounded-lg pt-2 pb-1 px-1">
                <h3 className="text-sm font-medium text-amber-500 dark:text-amber-400 mb-2 px-2">Parcialmente atribuídas</h3>
                {filteredTags
                  .filter(tag => partialTagIds.includes(tag.id))
                  .map(tag => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      isAssigned={false}
                      isPartial={true}
                      onToggle={handleTagToggle}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                      allowManage={true}
                    />
                  ))}
              </div>
            )}
            
            {/* Tags não atribuídas */}
            {unassignedTagIds.length > 0 && (
              <div className="bg-muted/10 rounded-lg pt-2 pb-1 px-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Não atribuídas</h3>
                {filteredTags
                  .filter(tag => unassignedTagIds.includes(tag.id))
                  .map(tag => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      isAssigned={false}
                      onToggle={handleTagToggle}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                      allowManage={true}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => {
            // Se houver uma função para fechar o diálogo de fora, use-a
            const event = new CustomEvent('closeTagManagerDialog');
            window.dispatchEvent(event);
          }}
        >
          Fechar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
      
      {/* Diálogo unificado para criação e edição de tags */}
      {editingTag && (
        <TagFormDialog
          tag={editingTag}
          onSave={(tagData) => {
            updateTag({
              id: editingTag.id,
              ...tagData
            })
            setEditingTag(null)
          }}
          onOpenChange={(open) => {
            if (!open) setEditingTag(null)
          }}
        />
      )}
    </div>
  )
} 