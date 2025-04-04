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
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { useContatos } from "@/contexts/contatos-context"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchField?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchField = "nome",
  searchPlaceholder = "Filtrar por nome...",
  emptyMessage = "Nenhum resultado encontrado."
}: DataTableProps<TData, TValue>) {
  const { selectedContatos, setSelectedContatos } = useContatos()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isInternalUpdate, setIsInternalUpdate] = React.useState(false)

  // Sincronizar seleção da tabela com o contexto de contatos
  React.useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false)
      return
    }
    
    // Obter os IDs de contatos das linhas selecionadas
    const selectedRowIds = Object.keys(rowSelection)
    
    if (selectedRowIds.length > 0) {
      const selectedIds = selectedRowIds.map(
        (idx) => (data[parseInt(idx)] as any).id
      )
      
      // Verificar se a seleção atual é diferente da seleção no contexto
      // antes de atualizar para evitar ciclos de renderização
      const currentSelectedIds = new Set(selectedIds)
      const contextSelectedIds = new Set(selectedContatos)
      
      // Verifica se os conjuntos são diferentes em tamanho ou conteúdo
      const needsUpdate = 
        currentSelectedIds.size !== contextSelectedIds.size || 
        selectedIds.some(id => !contextSelectedIds.has(id))
      
      if (needsUpdate) {
        setSelectedContatos(selectedIds)
      }
    } else if (selectedContatos.length > 0) {
      // Apenas limpar se o contexto tiver itens selecionados
      setSelectedContatos([])
    }
  }, [rowSelection, data, selectedContatos, setSelectedContatos])

  // Sincronizar o contexto de contatos com a seleção da tabela
  React.useEffect(() => {
    if (isInternalUpdate) return
    
    // Criar um mapa para busca rápida de IDs
    const dataIdMap = new Map(
      data.map((item, index) => [(item as any).id, index])
    )
    
    // Calcular nova seleção baseada nos IDs selecionados no contexto
    const newRowSelection: Record<number, boolean> = {}
    let hasChanges = false
    
    // Verificar cada ID selecionado no contexto
    selectedContatos.forEach(id => {
      const rowIndex = dataIdMap.get(id)
      if (rowIndex !== undefined) {
        newRowSelection[rowIndex] = true
        
        // Verificar se esta linha já estava selecionada
        if (!Object.prototype.hasOwnProperty.call(rowSelection, rowIndex.toString())) {
          hasChanges = true
        }
      }
    })
    
    // Verificar se alguma linha selecionada não está mais no contexto
    Object.keys(rowSelection).forEach(indexStr => {
      const index = parseInt(indexStr)
      const id = (data[index] as any)?.id
      
      if (id && !selectedContatos.includes(id)) {
        hasChanges = true
      }
    })
    
    // Só atualizar se houver mudanças reais na seleção
    if (hasChanges) {
      setIsInternalUpdate(true)
      setRowSelection(newRowSelection)
    }
  }, [selectedContatos, data, rowSelection, setRowSelection])

  const table = useReactTable({
    data,
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchField)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchField)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
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
  )
} 