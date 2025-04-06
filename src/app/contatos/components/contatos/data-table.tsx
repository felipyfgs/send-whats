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
import { ChevronDown, Search } from "lucide-react"

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
import { useContatos } from "@/app/contatos/components/contatos-context"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelectionChange?: (selectedRows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const { selectedContatos, setSelectedContatos, searchContatos, searchQuery } = useContatos()
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
      selectedContatos.forEach((id: string) => {
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
  }, [selectedContatos, data, rowSelection])
  
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

  // Atualizar a seleção de linhas quando necessário
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [table, rowSelection, onRowSelectionChange])

  // Função para lidar com a mudança na busca global
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Usar a função de busca global do contexto
    searchContatos(value)
  }

  // Tradução de nomes de colunas para o português para o dropdown
  const getColumnPortugueseName = (columnId: string) => {
    const columnNames: Record<string, string> = {
      name: "Nome",
      email: "Email",
      phone: "Telefone",
      category: "Categoria",
      company: "Empresa",
      role: "Cargo",
      notes: "Notas",
      tags: "Tags",
      select: "Selecionar",
      actions: "Ações"
    }
    
    return columnNames[columnId] || columnId
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-2 px-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar em todos os campos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm h-8 text-sm pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8 px-2 text-xs">
              Colunas <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {getColumnPortugueseName(column.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-8 px-2 py-1">
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
                  className="h-9"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 py-1">
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
                  className="h-20 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2 px-2">
        <div className="flex-1 text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
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