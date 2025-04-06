"use client"

import { useState } from "react"
import { Contato } from "../types"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContatoForm } from "./contato-form"

// Interface unificada para criar/editar contato
interface ContatoDialogProps {
  mode: "create" | "edit" | "view"
  contato?: Contato // Opcional para modo "create"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  triggerButton?: boolean // Se deve renderizar o botão trigger
  compact?: boolean // Se deve mostrar apenas o ícone (modo compacto)
}

export function ContatoDialog({ 
  mode = "create",
  contato,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  triggerButton = mode === "create", // Por padrão, mostra o botão apenas no modo create
  compact = false // Por padrão, mostra o texto junto com o ícone
}: ContatoDialogProps) {
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
    ? "Adicionar novo contato" 
    : mode === "edit" 
      ? "Editar contato" 
      : "Detalhes do contato"
  const description = mode === "create" 
    ? "Preencha os campos abaixo para adicionar um novo contato."
    : mode === "edit" 
      ? `Atualize as informações do contato "${contato?.name}".`
      : `Visualize as informações do contato "${contato?.name}".`
  
  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="mb-4">
        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>
      {mode === "view" ? (
        <div>
          {/* Implementar visualização de contato aqui*/}
          <p>{contato?.name}</p>
          <p>{contato?.email}</p>
          <p>{contato?.phone}</p>
        </div>
      ) : (
        <ContatoForm 
          contato={contato} 
          onSuccess={handleSuccess} 
          onCancel={() => setOpen(false)} 
        />
      )}
    </DialogContent>
  )
  
  // Se for modo controlado (sem botão trigger) ou modo editar
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
        {compact ? (
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground" 
            title="Novo Contato"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="default"
            className="h-8 px-3 gap-1.5 text-sm font-medium"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Novo Contato
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
} 