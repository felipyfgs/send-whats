"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "../ui/color-picker"
import { Tag } from "../types"

interface TagFormDialogProps {
  onSave: (tag: { name: string, color: string }) => void
  children?: React.ReactNode
  tag?: Tag | null
  triggerButton?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export function TagFormDialog({ onSave, children, tag = null, triggerButton, onOpenChange }: TagFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  
  // Preencher os campos se estiver editando uma tag existente
  useEffect(() => {
    if (tag) {
      setName(tag.name)
      setColor(tag.color)
    }
  }, [tag])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, color })
    setOpen(false)
    // Resetar os campos apenas se não estiver editando
    if (!tag) {
      setName("")
      setColor("#3b82f6")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }

  // Se não tiver children nem triggerButton, usar botão padrão
  const defaultTrigger = (
    <Button size="sm">Nova Tag</Button>
  )

  // Definir trigger para dialogo corretamente
  const trigger = triggerButton || children || defaultTrigger

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Editar Tag" : "Criar Nova Tag"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tag</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
              onClick={() => setOpen(false)}
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