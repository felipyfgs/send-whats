"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TagIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { TagManager } from "./tag-manager"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TagManagerFabProps {
  className?: string
}

export function TagManagerFab({ className }: TagManagerFabProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="default"
              className={cn(
                "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10 bg-primary hover:bg-primary/90 hover:scale-105 transition-transform",
                className
              )}
              onClick={() => setOpen(true)}
            >
              <TagIcon className="h-6 w-6 text-primary-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Gerenciar Tags</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Gerenciador de Tags</DialogTitle>
            <DialogDescription>
              Crie, edite ou remova tags do sistema ou aplique-as a contatos selecionados.
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
    </>
  )
} 