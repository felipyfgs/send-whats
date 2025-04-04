"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

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
  email: string
  telefone: string
  categoria: "pessoal" | "trabalho" | "familia" | "outro"
  tags: Tag[]
}

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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("nome")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => <div>{row.getValue("telefone")}</div>,
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
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contato = row.original
      const { deleteContato, selectContato, setSelectedContatos } = useContatos()
      const { showToast } = useToast()

      const handleDelete = async () => {
        try {
          await deleteContato(contato.id)
          showToast({
            title: "Contato excluído",
            description: `O contato ${contato.nome} foi excluído com sucesso.`,
          })
        } catch (error) {
          showToast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o contato. Tente novamente.",
            variant: "destructive",
          })
        }
      }

      const handleEdit = () => {
        // Implementação futura da edição
        showToast({
          title: "Edição de contato",
          description: `Edição do contato ${contato.nome} será implementada em breve.`,
        })
      }

      const handleManageTags = () => {
        // Seleciona apenas este contato para gerenciar tags
        setSelectedContatos([contato.id])
        // Implementação futura da gestão de tags individual
        showToast({
          title: "Gerenciar tags",
          description: `Use os botões de ação acima para gerenciar as tags de ${contato.nome}.`,
        })
      }

      return (
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
              onClick={() => {
                navigator.clipboard.writeText(contato.id)
                showToast({
                  title: "ID copiado",
                  description: "ID do contato copiado para a área de transferência.",
                })
              }}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              Editar contato
            </DropdownMenuItem>
            <DropdownMenuItem>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleManageTags}>
              Gerenciar tags
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive"
            >
              Excluir contato
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 