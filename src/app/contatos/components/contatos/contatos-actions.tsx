"use client"

import { useState, useCallback } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Button } from "@/components/ui/button"
import { 
  Trash2, 
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
import { ContatoDialog } from "./contato-dialog"
import { TagsButton } from "../tags/tags"

export function ContatosActions() {
  const { 
    selectedContatos, 
    deleteSelectedContatos
  } = useContatos()
  
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, deleteSelectedContatos, selectedContatos.length])

  // Componente otimizado para botões de ação
  const ActionsButtons = () => (
    <div className="flex items-center gap-1.5">
      <ContatoDialog mode="create" compact={true} />
    </div>
  )

  // Componente otimizado para botões de seleção
  const SelectionButtons = () => (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium">
        {selectedContatos.length} selecionado(s)
      </span>

      <TagsButton 
        contatoIds={selectedContatos}
        variant="outline"
        size="sm"
        className="h-8 px-2"
      >
        <Tag className="mr-1 h-3.5 w-3.5" />
        Gerenciar Tags
      </TagsButton>

      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="h-8 px-2"
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        Excluir
      </Button>
    </div>
  )

  return (
    <>
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
    </>
  )
} 