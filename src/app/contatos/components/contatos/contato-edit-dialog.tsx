"use client"

import { Contato } from "./columns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContatoForm } from "./contato-form"

interface ContatoEditDialogProps {
  contato: Contato
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ContatoEditDialog({ 
  contato, 
  open, 
  onOpenChange,
  onSuccess 
}: ContatoEditDialogProps) {
  
  const handleSuccess = () => {
    if (onSuccess) onSuccess()
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar contato</DialogTitle>
          <DialogDescription>
            Atualize as informações do contato "{contato.nome}".
          </DialogDescription>
        </DialogHeader>
        <ContatoForm 
          contato={contato} 
          onSuccess={handleSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
} 