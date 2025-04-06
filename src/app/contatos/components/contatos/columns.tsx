"use client"

import { useCallback, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Phone, Mail, User, Eye, TagIcon, Trash2, Check, X, CheckCheck } from "lucide-react"
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
import { Contato, Tag } from "../types"
import { categoryLabels } from "../../utils/contato-helpers"

// Componente para as células com ações do contato
function ActionsCell({ contato }: { contato: Contato }) {
  const { deleteContato, setSelectedContatos } = useContatos()
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const handleDelete = useCallback(async () => {
    try {
      await deleteContato(contato.id)
      toast.success(`O contato ${contato.name} foi excluído com sucesso`)
    } catch (error) {
      toast.error("Não foi possível excluir o contato")
    }
  }, [contato.id, contato.name, deleteContato])

  const handleViewDetails = useCallback(() => {
    setShowDetailDialog(true)
  }, [])

  const handleManageTags = useCallback(() => {
    // Seleciona apenas este contato para gerenciar tags
    setSelectedContatos([contato.id])
    // Abre o diálogo de tags
    if (window.openTagsDialog) {
      window.openTagsDialog([contato.id])
    }
  }, [contato.id, setSelectedContatos])

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
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={handleViewDetails} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageTags} className="cursor-pointer">
            <TagIcon className="mr-2 h-4 w-4" />
            Gerenciar tags
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
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
            style={{ backgroundColor: tag.color }}
            className="text-white"
          >
            {tag.name}
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
    header: ({ table }) => {
      const totalRows = table.getFilteredRowModel().rows.length;
      const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
      const isAllSelected = table.getIsAllRowsSelected();
      const isPartiallySelected = selectedRowsCount > 0 && !isAllSelected;
      const isAllPageRowsSelected = table.getIsAllPageRowsSelected();
      
      return (
        <Checkbox
          checked={isAllSelected ? true : (isPartiallySelected || isAllPageRowsSelected) ? "indeterminate" : false}
          onCheckedChange={(value) => {
            // Alternar entre selecionar todas as linhas e limpar a seleção
            if (isAllSelected) {
              // Se já estiver tudo selecionado, limpa a seleção
              table.toggleAllRowsSelected(false);
            } else if (selectedRowsCount > 0) {
              // Se tiver alguma linha selecionada, seleciona todas
              table.toggleAllRowsSelected(true);
            } else {
              // Do contrário, seleciona todas as linhas da página atual
              table.toggleAllPageRowsSelected(!!value);
            }
          }}
          aria-label="Selecionar todos"
          className="cursor-pointer"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: "name",
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
        <span>{row.getValue("name")}</span>
      </div>
    ),
    enableGlobalFilter: true,
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
    enableGlobalFilter: true,
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("phone")}</span>
      </div>
    ),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return <TagsCell tags={tags} />
    },
    enableGlobalFilter: true,
    filterFn: (row, columnId, filterValue) => {
      const tags = row.getValue(columnId) as Tag[];
      if (!tags || !Array.isArray(tags) || tags.length === 0) return false;
      
      // Verifica se alguma tag contém o termo de pesquisa
      return tags.some(tag => 
        tag.name.toLowerCase().includes(String(filterValue).toLowerCase())
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <ActionsCell contato={row.original} />,
  },
] 