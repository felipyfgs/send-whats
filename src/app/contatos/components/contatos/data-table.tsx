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
  const isUpdatingRef = React.useRef(false)
  const dataRef = React.useRef(data)
  
  // Atualizar a referência de dados quando os dados mudarem
  React.useEffect(() => {
    dataRef.current = data
  }, [data])

  // Sincronização simplificada: do contexto para a tabela
  React.useEffect(() => {
    if (isUpdatingRef.current) return
    
    // Mapeia todos os IDs dos dados atuais para seus índices para referência rápida
    const idToIndexMap = new Map<any, number>()
    data.forEach((item, index) => {
      const id = (item as any).id
      if (id !== undefined) idToIndexMap.set(id, index)
    })
    
    // Cria objeto de seleção otimizado
    const newSelection: Record<number, boolean> = {}
    
    // Mapeia seleções apenas se houver contatos selecionados
    if (selectedContatos.length > 0) {
      selectedContatos.forEach(id => {
        const index = idToIndexMap.get(id)
        if (index !== undefined) {
          newSelection[index] = true
        }
      })
    }
    
    // Verifica se a seleção realmente mudou antes de atualizar
    const needsUpdate = Object.keys(rowSelection).length !== Object.keys(newSelection).length ||
      Object.keys(newSelection).some(idx => {
        const idxAsNumber = parseInt(idx);
        return !rowSelection[idxAsNumber as keyof typeof rowSelection];
      })
    
    if (needsUpdate) {
      isUpdatingRef.current = true
      setRowSelection(newSelection)
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    }
  }, [selectedContatos, data])
  
  // Configuração da tabela com manipulador otimizado de seleção
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
      const newSelection = typeof updater === 'function' 
        ? updater(rowSelection)
        : updater
      
      setRowSelection(newSelection)
      
      // Atualiza o contexto de forma eficiente
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true
        
        // Executa de forma assíncrona para melhorar a performance de UI
        setTimeout(() => {
          // Extrai IDs selecionados
          const selectedIds = Object.entries(newSelection)
            .filter(([_, selected]) => selected)
            .map(([idx]) => {
              const item = dataRef.current[parseInt(idx)]
              return item ? (item as any).id : null
            })
            .filter(Boolean)
          
          setSelectedContatos(selectedIds)
          isUpdatingRef.current = false
        }, 0)
      }
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