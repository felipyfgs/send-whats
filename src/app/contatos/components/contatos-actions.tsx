"use client"

import { useState, useCallback } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Button } from "@/components/ui/button"
import { 
  Trash2, 
  RefreshCw, 
  Tag, 
  AlertTriangle
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ContatoCreateDialog } from "./contato-create-dialog"
import { TagManagerDialog } from "./tag-manager-dialog"

export function ContatosActions() {
  const { 
    selectedContatos, 
    deleteSelectedContatos, 
    refreshData
  } = useContatos()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
      
      <ContatoCreateDialog />
    </div>
  )

  // Componente otimizado para botões de seleção
  const SelectionButtons = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedContatos.length} selecionado(s)
      </span>

      <TagManagerDialog 
        trigger={
          <Button variant="outline" size="sm">
            <Tag className="mr-2 h-4 w-4" />
            Gerenciar Tags
          </Button>
        }
      />

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
    </div>
  )
} 