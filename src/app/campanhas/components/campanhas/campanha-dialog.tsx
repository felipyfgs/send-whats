"use client"

import { useState } from "react"
import { Campanha } from "@/contexts/campanhasContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CampanhaForm } from "./campanha-form"

// Interface para o componente de diálogo
interface CampanhaDialogProps {
  mode?: "create" | "edit" | "view"
  campanha?: Campanha
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  triggerButton?: React.ReactNode
  compact?: boolean
}

export function CampanhaDialog({ 
  mode = "create",
  campanha,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  triggerButton,
  compact = false
}: CampanhaDialogProps) {
  // Estado local para modo não controlado
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use o estado controlado ou interno
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen
  
  const handleSuccess = () => {
    if (onSuccess) onSuccess()
    setOpen(false)
  }
  
  // Determina o título e descrição com base no modo
  const title = mode === "create" 
    ? "Nova Campanha" 
    : mode === "edit" 
      ? "Editar Campanha" 
      : "Detalhes da Campanha"
  
  const description = mode === "create" 
    ? "Crie uma nova campanha para seus contatos."
    : mode === "edit" 
      ? `Atualize as informações da campanha "${campanha?.title}".`
      : `Visualize as informações da campanha "${campanha?.title}".`
  
  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="mb-4">
        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>
      <CampanhaForm 
        campanha={campanha}
        readOnly={mode === "view"}
        onSuccess={handleSuccess} 
        onCancel={() => setOpen(false)} 
      />
    </DialogContent>
  )
  
  // Se for modo controlado (sem botão trigger) ou modo editar/view
  if (!triggerButton) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    )
  }
  
  // Se for modo criar com botão trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
} 