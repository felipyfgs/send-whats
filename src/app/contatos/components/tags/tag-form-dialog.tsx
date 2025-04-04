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
import { ColorPicker } from "./color-picker"
import { Tag } from "../contatos/columns"

interface TagFormDialogProps {
  onSave: (tag: { nome: string, cor: string }) => void
  children?: React.ReactNode
  tag?: Tag | null
  triggerButton?: React.ReactNode
}

export function TagFormDialog({ onSave, children, tag = null, triggerButton }: TagFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [cor, setCor] = useState("#3b82f6")
  
  // Preencher os campos se estiver editando uma tag existente
  useEffect(() => {
    if (tag) {
      setNome(tag.nome)
      setCor(tag.cor)
    }
  }, [tag])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ nome, cor })
    setOpen(false)
    // Resetar os campos apenas se não estiver editando
    if (!tag) {
      setNome("")
      setCor("#3b82f6")
    }
  }

  // Se não tiver children nem triggerButton, usar botão padrão
  const defaultTrigger = (
    <Button size="sm">Nova Tag</Button>
  )

  // Definir trigger para dialogo corretamente
  const trigger = triggerButton || children || defaultTrigger

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Editar Tag" : "Criar Nova Tag"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Tag</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor</Label>
            <ColorPicker value={cor} onChange={setCor} />
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