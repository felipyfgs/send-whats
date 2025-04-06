"use client"

import { useState, useEffect } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Contato } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Tag as LucideTag,
  Edit
} from "lucide-react"
import { toast } from "sonner"
import { ContatoDialog } from "./contato-dialog"

interface ContatoDetailDialogProps {
  contatoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mapCategoryToPt = (category: 'personal' | 'work' | 'family' | 'other'): "pessoal" | "trabalho" | "familia" | "outro" => {
  const mapping = {
    personal: "pessoal",
    work: "trabalho",
    family: "familia",
    other: "outro"
  } as const;
  
  return mapping[category];
};

export function ContatoDetailDialog({ 
  contatoId, 
  open, 
  onOpenChange 
}: ContatoDetailDialogProps) {
  const { getContato, deleteContato } = useContatos()
  const [contato, setContato] = useState<Contato | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar dados do contato quando o ID mudar
  useEffect(() => {
    async function loadContato() {
      if (!contatoId) {
        setContato(null)
        return
      }

      setLoading(true)
      try {
        const data = await getContato(contatoId)
        setContato(data)
      } catch (error) {
        toast.error("Não foi possível carregar os detalhes do contato")
      } finally {
        setLoading(false)
      }
    }

    if (open && contatoId) {
      loadContato()
    }
  }, [contatoId, open, getContato])

  // Função para excluir o contato
  const handleDelete = async () => {
    if (!contato) return
    
    setIsDeleting(true)
    try {
      await deleteContato(contato.id)
      toast.success("Contato excluído com sucesso")
      onOpenChange(false)
    } catch (error) {
      toast.error("Não foi possível excluir o contato")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    
    // Recarregar os dados do contato após a edição
    if (contatoId) {
      getContato(contatoId).then(data => {
        setContato(data)
      })
    }
  }

  const handleManageTags = () => {
    if (contato && window.openTagsDialog) {
      window.openTagsDialog([contato.id])
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          {loading ? (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Contato</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando detalhes...</p>
              </div>
            </>
          ) : contato ? (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl font-semibold">
                    {contato.name}
                  </DialogTitle>
                  <Badge 
                    variant="outline" 
                    className="capitalize font-normal"
                  >
                    {mapCategoryToPt(contato.category)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEdit}
                    className="h-8"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManageTags}
                    className="h-8"
                  >
                    <LucideTag className="h-3.5 w-3.5 mr-1" />
                    Tags
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="mt-4 space-y-4 bg-muted/40 p-4 rounded-lg">
                {contato.email && (
                  <div className="flex items-center text-sm">
                    <div className="mr-2 rounded-full bg-primary/10 p-2">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <a href={`mailto:${contato.email}`} className="text-primary underline-offset-4 hover:underline">
                      {contato.email}
                    </a>
                  </div>
                )}
                
                {contato.phone && (
                  <div className="flex items-center text-sm">
                    <div className="mr-2 rounded-full bg-primary/10 p-2">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <a href={`tel:${contato.phone}`} className="text-primary underline-offset-4 hover:underline">
                      {contato.phone}
                    </a>
                  </div>
                )}
                
                {contato.company && (
                  <div className="flex items-center text-sm">
                    <div className="mr-2 rounded-full bg-primary/10 p-2">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <span>{contato.company}</span>
                  </div>
                )}
                
                {contato.role && (
                  <div className="flex items-center text-sm">
                    <div className="mr-2 rounded-full bg-primary/10 p-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <span>{contato.role}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {contato.tags && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <LucideTag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {contato.tags.length > 0 ? (
                      contato.tags.map((tag) => (
                        <Badge 
                          key={tag.id} 
                          style={{ backgroundColor: tag.color }}
                          className="text-white"
                        >
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Nenhuma tag atribuída</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notas */}
              {contato.notes && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-muted-foreground">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3 className="text-sm font-medium">Notas</h3>
                  </div>
                  <p className="text-sm bg-muted/40 p-3 rounded-md whitespace-pre-wrap">
                    {contato.notes}
                  </p>
                </div>
              )}
              
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir contato"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-4 text-center">
              <p>Contato não encontrado</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      {contato && (
        <ContatoDialog
          mode="edit"
          contato={contato}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
} 