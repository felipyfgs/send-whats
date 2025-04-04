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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Check, ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TagFormDialog } from "./tag-form-dialog"

interface TagSelectorTableProps {
  selectedTagIds: string[]
  onChange: (selectedIds: string[]) => void
  onCreateTag?: () => void
}

export function TagSelectorTable({ selectedTagIds, onChange, onCreateTag }: TagSelectorTableProps) {
  const { tags, createTag } = useContatos()
  const [open, setOpen] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [showTagForm, setShowTagForm] = React.useState(false)

  // Sincronizar a seleção do estado externo para a tabela
  React.useEffect(() => {
    // Criar objeto de seleção baseado no estado externo
    const newSelection: Record<number, boolean> = {}
    
    tags.forEach((tag, index) => {
      if (selectedTagIds.includes(tag.id)) {
        newSelection[index] = true
      }
    })
    
    setRowSelection(newSelection)
  }, [selectedTagIds, tags])

  // Sincronizar a seleção da tabela para o estado externo
  React.useEffect(() => {
    const selectedRows = Object.keys(rowSelection).map(
      index => tags[parseInt(index)]
    ).filter(Boolean)
    
    const selectedIds = selectedRows.map(tag => tag.id)
    
    // Verificar se há diferença na seleção
    const currentIds = new Set(selectedTagIds)
    const newIds = new Set(selectedIds)
    
    // Só atualizar se houver diferença
    if (
      selectedIds.length !== selectedTagIds.length ||
      selectedIds.some(id => !currentIds.has(id)) ||
      selectedTagIds.some(id => !newIds.has(id))
    ) {
      onChange(selectedIds)
    }
  }, [rowSelection, tags, onChange, selectedTagIds])

  // Definição das colunas da tabela
  const columns: ColumnDef<Tag>[] = [
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
          {row.getIsSelected() && (
            <Check className="h-4 w-4 text-green-500" />
          )}
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: tags,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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

  const handleCreateTag = (newTag: { nome: string, cor: string }) => {
    createTag(newTag)
    setShowTagForm(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTagIds.length > 0 ? (
            tags
              .filter(tag => selectedTagIds.includes(tag.id))
              .map(tag => (
                <Badge 
                  key={tag.id}
                  style={{ backgroundColor: tag.cor }}
                  className="text-white px-3 py-1"
                >
                  {tag.nome}
                </Badge>
              ))
          ) : (
            <span className="text-sm text-muted-foreground">Nenhuma tag selecionada</span>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Selecionar Tags
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Selecionar Tags</DialogTitle>
            </DialogHeader>
            
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTagForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Tag
                  </Button>
                  
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
                          className="cursor-pointer"
                          onClick={() => row.toggleSelected(!row.getIsSelected())}
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
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} tag(s) selecionada(s).
                </div>
                <Button
                  onClick={() => setOpen(false)}
                >
                  Concluir Seleção
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {showTagForm && (
        <TagFormDialog 
          onSave={handleCreateTag}
        >
          <span></span> {/* Placeholder para evitar problema com o Trigger */}
        </TagFormDialog>
      )}
    </div>
  )
} 