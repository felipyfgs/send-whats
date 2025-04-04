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
  onToggle: (tagId: string, assigned: boolean) => void
}

function TagItem({ tag, isAssigned, onToggle }: TagItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border border-transparent transition-all",
        isAssigned && "bg-muted/30"
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
      <span className="text-sm text-muted-foreground ml-auto">
        {isAssigned ? "Atribuída" : "Não atribuída"}
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
    setUnassignedTagIds([])
  }, [selectedContatosData, tags])
  
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags
    
    return tags.filter(tag => 
      tag.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tags, searchTerm])
  
  // Gerenciar a alteração nos checkboxes
  const handleTagToggle = (tagId: string, isAssigned: boolean) => {
    if (isAssigned) {
      // Adicionar à lista de tags atribuídas
      setAssignedTagIds(prev => [...prev, tagId])
      // Remover da lista de tags não atribuídas
      setUnassignedTagIds(prev => prev.filter(id => id !== tagId))
    } else {
      // Remover da lista de tags atribuídas
      setAssignedTagIds(prev => prev.filter(id => id !== tagId))
      // Adicionar à lista de tags não atribuídas
      setUnassignedTagIds(prev => [...prev, tagId])
    }
  }
  
  // Salvar alterações
  const handleSave = async () => {
    if (selectedContatos.length === 0) {
      toast.error("Nenhum contato selecionado")
      return
    }
    
    if (assignedTagIds.length === 0 && unassignedTagIds.length === 0) {
      toast.warning("Nenhuma alteração para salvar")
      return
    }
    
    setSaving(true)
    
    try {
      // Processar tags para adicionar
      if (assignedTagIds.length > 0) {
        await addTagsToSelectedContatos(assignedTagIds)
      }
      
      // Processar tags para remover
      if (unassignedTagIds.length > 0) {
        await removeTagsFromSelectedContatos(unassignedTagIds)
      }
      
      setAssignedTagIds([])
      setUnassignedTagIds([])
      
      toast.success(`Tags atualizadas para ${selectedContatos.length} contato(s)`)
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