"use client"

import { useCallback, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Phone, Mail, User, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useContatos } from "@/contexts/contatos-context"
import { toast } from "sonner"
import { ContatoDetailDialog } from "./contato-detail-dialog"

// Definição do tipo de dados para tags
export type Tag = {
  id: string
  nome: string
  cor: string
}

// Definição do tipo de dados para contatos
export type Contato = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  categoria: "pessoal" | "trabalho" | "familia" | "outro"
  tags: Tag[]
  empresa: string | null
  cargo: string | null
  observacoes: string | null
}

// Componente para as células com ações do contato
function ActionsCell({ contato }: { contato: Contato }) {
  const { deleteContato, setSelectedContatos } = useContatos()
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const handleDelete = useCallback(async () => {
    try {
      await deleteContato(contato.id)
      toast.success(`O contato ${contato.nome} foi excluído com sucesso`)
    } catch (error) {
      toast.error("Não foi possível excluir o contato")
      console.error("Erro ao excluir contato:", error)
    }
  }, [contato.id, contato.nome, deleteContato])

  const handleViewDetails = useCallback(() => {
    setShowDetailDialog(true)
  }, [])

  const handleManageTags = useCallback(() => {
    // Seleciona apenas este contato para gerenciar tags
    setSelectedContatos([contato.id])
    // Implementação futura da gestão de tags individual
    toast(`Use os botões de ação acima para gerenciar as tags de ${contato.nome}`)
  }, [contato.id, contato.nome, setSelectedContatos])

  const copyToClipboard = useCallback((text: string | null | undefined, message: string) => {
    if (text === null || text === undefined || text === "") {
      toast.error("Nada para copiar")
      return
    }
    navigator.clipboard.writeText(text)
    toast.success(message)
  }, [])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => copyToClipboard(
              contato.id, 
              "ID do contato copiado para a área de transferência"
            )}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyToClipboard(
              contato.email,
              "Email copiado para a área de transferência"
            )}
          >
            Copiar email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyToClipboard(
              contato.telefone,
              "Telefone copiado para a área de transferência"
            )}
          >
            Copiar telefone
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageTags}>
            Gerenciar tags
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive"
          >
            Excluir contato
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de detalhes */}
      <ContatoDetailDialog
        contatoId={contato.id}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </>
  )
}

// Componente para a célula de tags
function TagsCell({ tags }: { tags: Tag[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.length > 0 ? (
        tags.map((tag) => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.cor }}
            className="text-white"
          >
            {tag.nome}
          </Badge>
        ))
      ) : (
        <span className="text-muted-foreground text-sm">Sem tags</span>
      )}
    </div>
  )
}

// Definição das colunas
export const columns: ColumnDef<Contato>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <User className="mr-2 h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("nome")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center lowercase">
        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("telefone")}</span>
      </div>
    ),
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("categoria")}</div>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return <TagsCell tags={tags} />
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell contato={row.original} />,
  },
] 