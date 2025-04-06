"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "./tag-components"
import { Tag } from "../types"

interface TagFormDialogProps {
  onSave: (tag: { name: string, color: string }) => void
  children?: React.ReactNode
  tag?: Tag | null
  triggerButton?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

export function TagFormDialog({ 
  onSave, 
  children, 
  tag = null, 
  triggerButton, 
  onOpenChange, 
  defaultOpen = true 
}: TagFormDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  
  // Atualizar estado open quando defaultOpen mudar
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);
  
  // Preencher os campos se estiver editando uma tag existente - apenas uma vez
  useEffect(() => {
    if (tag) {
      setName(tag.name)
      setColor(tag.color)
    }
  }, [tag])

  // Notificar o componente pai sobre mudanças no estado
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name.trim()) {
      return; // Evitar envio de tags com nome vazio
    }
    
    onSave({ name, color })
    setOpen(false)
    
    // Resetar os campos apenas se não estiver editando
    if (!tag) {
      setName("")
      setColor("#3b82f6")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dialog open state changed:", newOpen); // Log para depuração
    setOpen(newOpen);
  }

  // Se não tiver children nem triggerButton, não precisamos de trigger
  const hasTrigger = !!triggerButton || !!children;
  const defaultTrigger = <span className="hidden"></span>;
  const trigger = triggerButton || children || defaultTrigger;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {hasTrigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{tag ? "Editar Tag" : "Criar Nova Tag"}</DialogTitle>
          <DialogDescription>
            {tag 
              ? "Modifique o nome e a cor da tag existente" 
              : "Adicione uma nova tag com nome e cor personalizada"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tag</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">{tag ? "Atualizar" : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}