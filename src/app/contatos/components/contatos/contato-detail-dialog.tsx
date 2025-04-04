"use client"

import { useState, useEffect } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Contato, Tag } from "../types"
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
  Edit,
  Trash2,
  User
} from "lucide-react"
import { ContatoCategoriaIcon } from "./contato-utils"
import { ContatoEditDialog } from "./contato-edit-dialog"
import { toast } from "sonner"

// Função para mapear categorias em inglês para português
const mapCategoryToPt = (category: "personal" | "work" | "family" | "other"): "pessoal" | "trabalho" | "familia" | "outro" => {
  const mapping = {
    personal: "pessoal",
    work: "trabalho",
    family: "familia",
    other: "outro"
  } as const
  
  return mapping[category]
}

interface ContatoDetailDialogProps {
  contatoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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
        console.error("Erro ao carregar contato:", error)
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
      console.error("Erro ao excluir contato:", error)
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
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  {contato.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center text-sm">
                  <div className="mr-2 rounded-full bg-primary/10 p-2">
                    <ContatoCategoriaIcon categoria={mapCategoryToPt(contato.category)} className="h-4 w-4 text-primary" />
                  </div>
                  <span className="capitalize">{contato.category}</span>
                </div>
                
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
                
                {contato.tags && contato.tags.length > 0 && (
                  <div className="flex items-start text-sm">
                    <div className="mr-2 mt-1 rounded-full bg-primary/10 p-2">
                      <LucideTag className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {contato.tags.map((tag) => (
                        <Badge 
                          key={tag.id} 
                          style={{ backgroundColor: tag.color }}
                          className="text-white"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {contato.notes && (
                  <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                    <h4 className="mb-1 font-medium">Observações:</h4>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {contato.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6 flex justify-between sm:justify-between">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Contato</DialogTitle>
              </DialogHeader>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Contato não encontrado.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de edição */}
      {contato && (
        <ContatoEditDialog 
          contato={contato}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
} 