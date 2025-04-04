"use client"

import * as React from "react"
import { CheckCircle, MoreHorizontal, Pencil, Plus, Search, Trash2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useContatos } from "@/contexts/contatos-context"
import { Tag } from "../types"
import { toast } from "sonner"
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
import { TagFormDialog } from "./tag-form-dialog"
import { MultiSelect, OptionType } from "../contatos/multi-select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Componente para botão de ação da tag
const TagActions = React.memo(
  ({ tag, onEdit, onDelete }: { tag: Tag; onEdit: (tag: Tag) => void; onDelete: (id: string) => void }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(tag)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Tag
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(tag.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Tag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
TagActions.displayName = "TagActions";

// Componente de card de tag
const TagCard = React.memo(
  ({ 
    tag, 
    isSelected, 
    onToggleSelect, 
    onEdit, 
    onDelete 
  }: { 
    tag: Tag; 
    isSelected: boolean; 
    onToggleSelect: (id: string) => void; 
    onEdit: (tag: Tag) => void; 
    onDelete: (id: string) => void 
  }) => {
    return (
      <Card 
        className={`relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
        onClick={() => onToggleSelect(tag.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge 
              style={{ backgroundColor: tag.color }}
              className="text-white px-3 py-1 text-sm"
            >
              {tag.name}
            </Badge>
            
            <div className="flex items-center gap-1">
              {isSelected && (
                <CheckCircle className="h-5 w-5 text-primary mr-1" />
              )}
              <TagActions tag={tag} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          <div 
            className="w-full h-3 rounded-full" 
            style={{ backgroundColor: tag.color, opacity: 0.2 }}
          />
        </CardContent>
      </Card>
    )
  }
)
TagCard.displayName = "TagCard"

export function TagTable() {
  // 1. Contexto (useContext) - Sempre primeiro
  const { tags, updateTag, deleteTag } = useContatos()
  
  // 2. Estados (useState) - Todos os estados agrupados juntos
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null)
  const [showTagForm, setShowTagForm] = React.useState(false)
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [itemsPerPage] = React.useState(12)
  
  // 3. Callbacks (useCallback) - Definir antes dos memos que dependem deles
  const handleEditTag = React.useCallback((tag: Tag) => {
    setEditingTag(tag)
    setShowTagForm(true)
  }, [])

  const handleDeleteSingleTag = React.useCallback(async (id: string) => {
    try {
      await deleteTag(id)
      toast.success("Tag excluída com sucesso")
    } catch (error) {
      console.error("Erro ao excluir tag:", error)
      toast.error("Erro ao excluir a tag")
    }
  }, [deleteTag])

  const handleDeleteSelectedTags = React.useCallback(async () => {
    if (selectedTagIds.length === 0) {
      toast.error("Nenhuma tag selecionada")
      return
    }
    
    setShowDeleteAlert(true)
  }, [selectedTagIds])

  const confirmDeleteSelectedTags = React.useCallback(async () => {
    try {
      // Excluir tags em sequência sem notificações individuais
      const tagsToDelete = [...selectedTagIds] // Criar uma cópia para não modificar o original
      let tagsExcluidas = 0
      
      // Usar Promise.all para executar operações em paralelo para melhor performance
      const deletePromises = tagsToDelete.map(async (tagId) => {
        try {
          await deleteTag(tagId, true) // Passar true para o parâmetro silent
          return true
        } catch (error) {
          console.error(`Erro ao excluir tag ${tagId}:`, error)
          return false
        }
      })
      
      // Aguardar todas as operações e contar sucessos
      const results = await Promise.all(deletePromises)
      tagsExcluidas = results.filter(result => result).length
      
      // Exibir apenas uma notificação ao final do processo
      if (tagsExcluidas > 0) {
        toast.success(`${tagsExcluidas} tag${tagsExcluidas > 1 ? 's' : ''} excluída${tagsExcluidas > 1 ? 's' : ''} com sucesso`)
      } else {
        toast.error("Não foi possível excluir as tags selecionadas")
      }
      
      setSelectedTagIds([])
      setShowDeleteAlert(false)
    } catch (error) {
      console.error("Erro ao excluir tags em massa:", error)
      toast.error("Erro ao excluir as tags selecionadas")
    }
  }, [deleteTag, selectedTagIds])
  
  // Função de manipulação do formulário
  const handleTagFormSave = React.useCallback((tagData: { name: string, color: string }) => {
    if (editingTag) {
      updateTag({
        id: editingTag.id,
        ...tagData
      }).then(() => {
        toast.success("Tag atualizada com sucesso")
      }).catch((error) => {
        console.error("Erro ao atualizar tag:", error)
        toast.error("Erro ao atualizar a tag")
      })
    }
    setShowTagForm(false)
    setEditingTag(null)
  }, [editingTag, updateTag])
  
  // Manipulador de seleção de tags
  const handleTagSelection = React.useCallback((selectedValues: string[]) => {
    setSelectedTagIds(selectedValues)
  }, [])
  
  // Manipulador para alternar seleção de tag ao clicar na linha
  const toggleTagSelection = React.useCallback((tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }, [])
  
  // Selecionar/desselecionar todas as tags
  const toggleSelectAllTags = React.useCallback(() => {
    if (selectedTagIds.length === filteredTags.length) {
      // Se todas estiverem selecionadas, desseleciona todas
      setSelectedTagIds([])
    } else {
      // Seleciona todas
      setSelectedTagIds(filteredTags.map(tag => tag.id))
    }
  }, [selectedTagIds])
  
  // 4. Memos (useMemo) - Todos os useMemo juntos
  // Filtrar tags com base na pesquisa
  const filteredTags = React.useMemo(() => {
    if (!searchQuery.trim()) return tags;
    
    const lowerQuery = searchQuery.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery)
    );
  }, [tags, searchQuery]);
  
  // Converter tags para o formato de opções para o multiselect
  const tagOptions = React.useMemo<OptionType[]>(() => {
    return tags.map(tag => ({
      value: tag.id,
      label: tag.name,
      color: tag.color
    }))
  }, [tags])
  
  // Calcular paginação
  const paginatedTags = React.useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredTags.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTags, currentPage, itemsPerPage]);
  
  // Calcular o número total de páginas
  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredTags.length / itemsPerPage);
  }, [filteredTags, itemsPerPage]);

  // 5. Renderização
  return (
    <>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between py-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedTagIds.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteSelectedTags}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Selecionadas
              </Button>
            )}
            
            <Button 
              variant={selectedTagIds.length === filteredTags.length ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectAllTags}
            >
              {selectedTagIds.length === filteredTags.length 
                ? "Desselecionar Todas" 
                : "Selecionar Todas"}
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <MultiSelect
            options={tagOptions}
            selected={selectedTagIds}
            onChange={handleTagSelection}
            placeholder="Selecionar tags..."
            displayColors={true}
            maxDisplay={5}
          />
        </div>
        
        {/* Grid de cards de tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedTags.length > 0 ? (
            paginatedTags.map(tag => (
              <TagCard 
                key={tag.id}
                tag={tag}
                isSelected={selectedTagIds.includes(tag.id)}
                onToggleSelect={toggleTagSelection}
                onEdit={handleEditTag}
                onDelete={handleDeleteSingleTag}
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              Nenhuma tag encontrada.
            </div>
          )}
        </div>
        
        {/* Paginação e contador */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedTagIds.length} de{" "}
            {filteredTags.length} tag(s) selecionada(s).
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage + 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedTagIds.length} tag(s).
              Esta ação não pode ser desfeita e as tags serão removidas de todos os contatos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteSelectedTags}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar tags */}
      {showTagForm && (
        <TagFormDialog
          tag={editingTag}
          onSave={handleTagFormSave}
        />
      )}
    </>
  )
}