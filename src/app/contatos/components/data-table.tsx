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
  const lastSelectionRef = React.useRef<Record<string, boolean>>({})
  const ignoreEffectRef = React.useRef(false)

  // Uma única direção de sincronização: da tabela para o contexto
  // Isso simplifica o fluxo de dados e melhora o desempenho
  React.useEffect(() => {
    // Se estamos ignorando o efeito (porque estamos atualizando da tabela), saia
    if (ignoreEffectRef.current) {
      ignoreEffectRef.current = false
      return
    }

    // Compare rowSelection com a última seleção para evitar atualizações desnecessárias
    const currentSelectionStr = JSON.stringify(rowSelection)
    const lastSelectionStr = JSON.stringify(lastSelectionRef.current)
    
    if (currentSelectionStr === lastSelectionStr) {
      return // Não houve mudança real, evitar atualização
    }
    
    // Atualizar a referência de última seleção
    lastSelectionRef.current = {...rowSelection}
    
    // Converter as linhas selecionadas para IDs de contatos
    const selectedIds = Object.keys(rowSelection)
      .map(idx => (data[parseInt(idx)] as any)?.id)
      .filter(Boolean) // Remover possíveis valores undefined ou null
    
    // Atualizar o contexto com os IDs selecionados
    setSelectedContatos(selectedIds)
  }, [rowSelection, data, setSelectedContatos])

  // Sincronizar seleções externas (do contexto) para a tabela
  // Somente quando o selectedContatos muda e não é causado pela tabela
  React.useEffect(() => {
    // Mapeamento rápido de ID para índice
    const idToIndexMap = new Map()
    data.forEach((item, index) => {
      const id = (item as any).id
      if (id) idToIndexMap.set(id, index)
    })
    
    // Criar objeto de seleção baseado nos IDs dos contatos
    const newSelection: Record<number, boolean> = {}
    let hasChanges = false
    
    // Verificar cada ID selecionado no contexto
    for (const id of selectedContatos) {
      const rowIndex = idToIndexMap.get(id)
      if (rowIndex !== undefined) {
        newSelection[rowIndex] = true
        
        // Verificar se esta seleção é diferente da atual
        if (!Object.prototype.hasOwnProperty.call(rowSelection, rowIndex.toString())) {
          hasChanges = true
        }
      }
    }
    
    // Verificar se alguma linha selecionada não está mais no contexto
    Object.keys(rowSelection).forEach(indexStr => {
      const index = parseInt(indexStr)
      if (Object.prototype.hasOwnProperty.call(rowSelection, indexStr) && !newSelection[index]) {
        hasChanges = true
      }
    })
    
    // Só atualizar se houver mudanças reais
    if (hasChanges) {
      // Impedir que a atualização da tabela acione o outro efeito
      ignoreEffectRef.current = true
      setRowSelection(newSelection)
    }
  }, [selectedContatos, data, rowSelection])

  // Configuração da tabela
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
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)
    },
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