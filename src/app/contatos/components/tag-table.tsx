"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useContatos } from "@/contexts/contatos-context"
import { Tag } from "./columns"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TagFormDialog } from "./tag-form-dialog"

// Extrair o componente de ação de tag para evitar hooks dentro de renderização
const TagActionCell = React.memo(
  ({ tag, onEdit, onDelete }: { tag: Tag; onEdit: (tag: Tag) => void; onDelete: (id: string) => void }) => {
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
          <DropdownMenuItem onClick={() => onEdit(tag)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Tag
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(tag.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Tag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
TagActionCell.displayName = "TagActionCell";

export function TagTable() {
  // 1. Contexto (useContext) - Sempre primeiro
  const { tags, updateTag, deleteTag } = useContatos()
  
  // 2. Estados (useState) - Todos os estados agrupados juntos
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null)
  const [showTagForm, setShowTagForm] = React.useState(false)
  
  // 3. Memos (useMemo) - Todos os useMemo juntos
  // Definição das colunas da tabela
  const columns = React.useMemo<ColumnDef<Tag>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todas"
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge 
            style={{ backgroundColor: row.original.cor }}
            className="text-white px-3 py-1"
          >
            {row.getValue("nome")}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return <TagActionCell tag={row.original} onEdit={handleEditTag} onDelete={handleDeleteSingleTag} />;
      },
    },
  ], [handleEditTag, handleDeleteSingleTag])
  
  // 4. Callbacks (useCallback) - Todos os callbacks juntos
  const handleEditTag = React.useCallback((tag: Tag) => {
    setEditingTag(tag)
    setShowTagForm(true)
  }, [])

  const handleDeleteSingleTag = React.useCallback(async (id: string) => {
    try {
      await deleteTag(id)
      toast.success("Tag excluída com sucesso")
    } catch (error) {
      console.error("Erro ao excluir tag:", error)
      toast.error("Erro ao excluir a tag")
    }
  }, [deleteTag])

  const handleDeleteSelectedTags = React.useCallback(async () => {
    const selectedRows = Object.keys(rowSelection).map(
      index => tags[parseInt(index)]
    )
    
    if (selectedRows.length === 0) {
      toast.error("Nenhuma tag selecionada")
      return
    }
    
    setShowDeleteAlert(true)
  }, [rowSelection, tags])

  const confirmDeleteSelectedTags = React.useCallback(async () => {
    const selectedRows = Object.keys(rowSelection).map(
      index => tags[parseInt(index)]
    )
    
    try {
      // Excluir tags em sequência sem notificações individuais
      const tagsToDelete = [...selectedRows] // Criar uma cópia para não modificar o original
      let tagsExcluidas = 0
      
      // Usar Promise.all para executar operações em paralelo para melhor performance
      const deletePromises = tagsToDelete.map(async (tag) => {
        try {
          await deleteTag(tag.id, true) // Passar true para o parâmetro silent
          return true
        } catch (error) {
          console.error(`Erro ao excluir tag ${tag.id}:`, error)
          return false
        }
      })
      
      // Aguardar todas as operações e contar sucessos
      const results = await Promise.all(deletePromises)
      tagsExcluidas = results.filter(result => result).length
      
      // Exibir apenas uma notificação ao final do processo
      if (tagsExcluidas > 0) {
        toast.success(`${tagsExcluidas} tag${tagsExcluidas > 1 ? 's' : ''} excluída${tagsExcluidas > 1 ? 's' : ''} com sucesso`)
      } else {
        toast.error("Não foi possível excluir as tags selecionadas")
      }
      
      setRowSelection({})
      setShowDeleteAlert(false)
    } catch (error) {
      console.error("Erro ao excluir tags em massa:", error)
      toast.error("Erro ao excluir as tags selecionadas")
    }
  }, [deleteTag, rowSelection, tags])
  
  // Função de manipulação do formulário
  const handleTagFormSave = React.useCallback((tagData: { nome: string, cor: string }) => {
    if (editingTag) {
      updateTag({
        id: editingTag.id,
        ...tagData
      }).then(() => {
        toast.success("Tag atualizada com sucesso")
      }).catch((error) => {
        console.error("Erro ao atualizar tag:", error)
        toast.error("Erro ao atualizar a tag")
      })
    }
    setShowTagForm(false)
    setEditingTag(null)
  }, [editingTag, updateTag])

  // Configuração da tabela
  const table = useReactTable({
    data: tags,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Valores derivados
  const filteredSelectedRowCount = React.useMemo(
    () => table.getFilteredSelectedRowModel().rows.length,
    [table]
  )
  
  const filteredRowCount = React.useMemo(
    () => table.getFilteredRowModel().rows.length,
    [table]
  )

  // 5. Renderização
  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Input
              placeholder="Filtrar tags..."
              value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("nome")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {filteredSelectedRowCount > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteSelectedTags}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Selecionadas
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colunas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhuma tag encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {filteredSelectedRowCount} de{" "}
            {filteredRowCount} tag(s) selecionada(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {filteredSelectedRowCount} tag(s).
              Esta ação não pode ser desfeita e as tags serão removidas de todos os contatos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteSelectedTags}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar tags */}
      {showTagForm && (
        <TagFormDialog
          tag={editingTag}
          onSave={handleTagFormSave}
        />
      )}
    </>
  )
} 