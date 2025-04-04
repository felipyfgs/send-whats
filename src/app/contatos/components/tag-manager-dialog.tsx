"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TagManager } from "./tag-manager"
import { useState, useEffect } from "react"

interface TagManagerDialogProps {
  children?: React.ReactNode
  trigger?: React.ReactNode
}

export function TagManagerDialog({ children, trigger }: TagManagerDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleCloseDialog = () => {
      setOpen(false)
    }

    window.addEventListener('closeTagManagerDialog', handleCloseDialog)
    
    return () => {
      window.removeEventListener('closeTagManagerDialog', handleCloseDialog)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            Gerenciar Tags
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Gerenciador de Tags</DialogTitle>
          <DialogDescription>
            Marque ou desmarque as tags que deseja adicionar ou remover dos contatos selecionados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <TagManager />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 