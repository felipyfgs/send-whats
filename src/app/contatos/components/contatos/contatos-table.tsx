"use client"

import React, { useState } from "react"
import {
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
import { ChevronDown, Search, UserX, Tag } from "lucide-react"

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
import { columns } from "./columns"
import { ContatosActions } from "./contatos-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Contato } from "@/app/contatos/components/types"

export default function ContatosTable() {
  const { contatos, loading, selectedContatos, setSelectedContatos } = useContatos()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedRows, setSelectedRows] = useState<Contato[]>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // Sincronização entre seleção da tabela e contexto
  React.useEffect(() => {
    if (Object.keys(rowSelection).length > 0) {
      const selectedIds = Object.entries(rowSelection)
        .filter(([_, selected]) => selected)
        .map(([idx]) => {
          const item = contatos[parseInt(idx)]
          return item ? item.id : null
        })
        .filter(Boolean) as string[]
      
      setSelectedContatos(selectedIds)
    } else if (Object.keys(rowSelection).length === 0 && selectedContatos.length > 0) {
      setSelectedContatos([])
    }
  }, [rowSelection, contatos, setSelectedContatos])

  const handleRowSelectionChange = (selectedRows: any[]) => {
    setSelectedRows(selectedRows)
  }

  // Função de filtro personalizada que busca em todos os campos, incluindo tags
  const fuzzyFilter = (row: any, columnId: string, value: string) => {
    const contato = row.original as Contato
    
    if (!value || value.length === 0) return true

    const searchTerms = value.toLowerCase().split(/\s+/)
    
    return searchTerms.every(term => {
      // Procura o termo em todos os campos de texto
      const inBasicFields = 
        (contato.name && contato.name.toLowerCase().includes(term)) || 
        (contato.email && contato.email.toLowerCase().includes(term)) || 
        (contato.phone && contato.phone.toLowerCase().includes(term)) || 
        (contato.category && contato.category.toLowerCase().includes(term)) || 
        (contato.company && contato.company.toLowerCase().includes(term)) || 
        (contato.role && contato.role.toLowerCase().includes(term)) || 
        (contato.notes && contato.notes.toLowerCase().includes(term))
      
      // Procura o termo nas tags - garantir que contato.tags existe e é um array
      const inTags = Array.isArray(contato.tags) && contato.tags.length > 0 && 
        contato.tags.some(tag => 
          (tag && tag.name && tag.name.toLowerCase().includes(term)) || 
          (tag && tag.description && tag.description.toLowerCase().includes(term))
        )
      
      return inBasicFields || inTags
    })
  }

  // Inicialização da tabela ANTES da verificação de loading
  const table = useReactTable({
    data: contatos,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  if (loading) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Carregando contatos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <div className="w-full space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 pt-3 pb-2">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em todas as colunas e tags..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <ContatosActions />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-1.5 h-9">
                    Colunas <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
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
                          {column.id === "name" ? "Nome" : 
                           column.id === "email" ? "Email" : 
                           column.id === "phone" ? "Telefone" : 
                           column.id === "category" ? "Categoria" : 
                           column.id === "tags" ? "Tags" : 
                           column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-3">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
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
                        <TableCell key={cell.id} className="px-3">
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
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                        <UserX className="h-10 w-10 mb-2 opacity-30" />
                        <p>Nenhum contato encontrado.</p>
                        <p className="text-xs">Tente alterar os filtros de busca ou crie um novo contato.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex-1 text-xs text-muted-foreground">
              {table.getFilteredRowModel().rows.length} contato(s) encontrado(s).
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8"
              >
                Anterior
              </Button>
              <div className="text-xs text-muted-foreground">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8"
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 