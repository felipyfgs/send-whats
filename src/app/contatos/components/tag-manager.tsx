"use client"

import { useState, useEffect, useMemo } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Tag } from "./columns"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, TagIcon, Plus, X, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { TagFormDialog } from "./tag-form-dialog"
import { toast } from "sonner"

interface TagItemProps {
  tag: Tag
  isAssigned: boolean
  isPartial?: boolean
  onToggle: (tagId: string, assigned: boolean) => void
}

function TagItem({ tag, isAssigned, isPartial = false, onToggle }: TagItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border border-transparent transition-all hover:bg-muted/20",
        isAssigned && "bg-muted/30",
        isPartial && "border-dashed border-muted-foreground/30"
      )}
    >
      <Checkbox
        id={`tag-${tag.id}`}
        checked={isAssigned}
        onCheckedChange={(checked) => onToggle(tag.id, checked as boolean)}
      />
      <Badge
        style={{ backgroundColor: tag.cor }}
        className="text-white px-3 py-1"
      >
        {tag.nome}
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
    </div>
  )
}

export function TagManager() {
  const { 
    tags,
    contatos, 
    selectedContatos, 
    addTagsToSelectedContatos, 
    removeTagsFromSelectedContatos
  } = useContatos()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTagIds, setAssignedTagIds] = useState<string[]>([])
  const [unassignedTagIds, setUnassignedTagIds] = useState<string[]>([])
  const [showTagForm, setShowTagForm] = useState(false)
  const [saving, setSaving] = useState(false)
  
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
  
  const [partialTagIds, setPartialTagIds] = useState<string[]>([])
  
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags
    
    return tags.filter(tag => 
      tag.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  if (selectedContatos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Tags</CardTitle>
          <CardDescription>
            Selecione um ou mais contatos para gerenciar suas tags
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center text-muted-foreground">
            <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum contato selecionado</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Gerenciar Tags</CardTitle>
            <CardDescription>
              {selectedContatos.length === 1 
                ? `Gerenciando tags para 1 contato` 
                : `Gerenciando tags para ${selectedContatos.length} contatos`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTagForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedContatos.length > 1 && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm border border-muted">
              <p className="font-medium mb-1">Gerenciando tags para múltiplos contatos</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Tags <span className="text-green-600 dark:text-green-500">atribuídas a todos</span> os contatos estão marcadas</li>
                <li>Tags <span className="text-amber-500 dark:text-amber-400">parcialmente atribuídas</span> estão presentes em alguns contatos, mas não todos</li>
                <li>Ao marcar uma tag, ela será adicionada a todos os contatos selecionados</li>
                <li>Ao desmarcar uma tag, ela será removida de todos os contatos selecionados</li>
              </ul>
            </div>
          )}
          
          <div className="relative">
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
          
          {filteredTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TagIcon className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
              <p className="text-muted-foreground">Nenhuma tag encontrada</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 rounded-md">
              {filteredTags.map(tag => (
                <TagItem 
                  key={tag.id}
                  tag={tag}
                  isAssigned={assignedTagIds.includes(tag.id)}
                  isPartial={partialTagIds.includes(tag.id)}
                  onToggle={handleTagToggle}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={saving}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saving || (assignedTagIds.length === 0 && unassignedTagIds.length === 0)}
        >
          {saving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </CardFooter>
      
      {showTagForm && (
        <TagFormDialog
          onSave={() => {
            setShowTagForm(false)
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTagForm(false)}
          >
            Cancelar
          </Button>
        </TagFormDialog>
      )}
    </Card>
  )
} 