"use client"

import { useState } from "react"
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
import { ColorPicker } from "@/app/contatos/components/color-picker"

interface TagFormDialogProps {
  onSave: (tag: { nome: string, cor: string }) => void
  children?: React.ReactNode
}

export function TagFormDialog({ onSave, children }: TagFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [cor, setCor] = useState("#3b82f6")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ nome, cor })
    setOpen(false)
    setNome("")
    setCor("#3b82f6")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">Nova Tag</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Tag</DialogTitle>
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
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}