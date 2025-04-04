"use client"

import { useState, useCallback } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Button } from "@/components/ui/button"
import { 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  Tag, 
  AlertTriangle, 
  CheckCircle2 
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { TagSelector } from "./tag-selector"
import { toast } from "sonner"

export function ContatosActions() {
  const { 
    selectedContatos, 
    deleteSelectedContatos, 
    refreshData,
    addTagsToSelectedContatos,
    removeTagsFromSelectedContatos,
    tags
  } = useContatos()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isTagSelectionType, setIsTagSelectionType] = useState<'add' | 'remove'>('add')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Função para atualizar os dados - usando useCallback para evitar re-renders desnecessários
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await refreshData()
      toast.success("Dados atualizados com sucesso")
    } catch (error) {
      toast.error("Erro ao atualizar os dados")
      console.error("Erro ao atualizar:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshData])

  // Função para confirmar exclusão de contatos
  const handleDeleteConfirm = useCallback(async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await deleteSelectedContatos()
      setIsDeleteDialogOpen(false)
      toast.success(`${selectedContatos.length} contato(s) excluído(s)`)
    } catch (error) {
      toast.error("Erro ao excluir contatos")
      console.error("Erro ao excluir:", error)
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, deleteSelectedContatos, selectedContatos.length])

  // Função para abrir o diálogo de tags (adicionar ou remover)
  const handleTagsDialog = useCallback((type: 'add' | 'remove') => {
    setIsTagSelectionType(type)
    setSelectedTagIds([])
    setIsTagDialogOpen(true)
  }, [])

  // Função para confirmar a operação de tags
  const handleTagsConfirm = useCallback(async () => {
    if (selectedTagIds.length === 0) return

    try {
      if (isTagSelectionType === 'add') {
        await addTagsToSelectedContatos(selectedTagIds)
        toast.success("Tags adicionadas com sucesso")
      } else {
        await removeTagsFromSelectedContatos(selectedTagIds)
        toast.success("Tags removidas com sucesso")
      }
      setIsTagDialogOpen(false)
    } catch (error) {
      toast.error(`Erro ao ${isTagSelectionType === 'add' ? 'adicionar' : 'remover'} tags`)
      console.error("Erro ao gerenciar tags:", error)
    }
  }, [
    selectedTagIds, 
    isTagSelectionType, 
    addTagsToSelectedContatos, 
    removeTagsFromSelectedContatos
  ])

  // Componente otimizado para botões de ação
  const ActionsButtons = () => (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw 
          className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
      </Button>
      
      <Button size="sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        Novo Contato
      </Button>
    </div>
  )

  // Componente otimizado para botões de seleção
  const SelectionButtons = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedContatos.length} selecionado(s)
      </span>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleTagsDialog('add')}
      >
        <Tag className="mr-2 h-4 w-4" />
        Adicionar Tags
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleTagsDialog('remove')}
      >
        <Tag className="mr-2 h-4 w-4" />
        Remover Tags
      </Button>

      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
      </Button>
    </div>
  )

  return (
    <div className="mb-4 flex items-center justify-between">
      <ActionsButtons />
      {selectedContatos.length > 0 && <SelectionButtons />}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir {selectedContatos.length} contato(s).
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center text-amber-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <p>Os contatos excluídos serão permanentemente removidos do sistema.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de seleção de tags */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isTagSelectionType === 'add' ? 'Adicionar tags' : 'Remover tags'}
            </DialogTitle>
            <DialogDescription>
              {isTagSelectionType === 'add' 
                ? 'Selecione as tags que deseja adicionar aos contatos selecionados.' 
                : 'Selecione as tags que deseja remover dos contatos selecionados.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <TagSelector 
              tags={tags}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>
          {selectedTagIds.length > 0 && (
            <div className="flex items-center text-green-600 mb-4">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <p>{selectedTagIds.length} tag(s) selecionada(s)</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTagDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTagsConfirm}
              disabled={selectedTagIds.length === 0}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 