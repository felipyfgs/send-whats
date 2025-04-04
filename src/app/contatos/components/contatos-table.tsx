"use client"

import { useContatos } from "@/contexts/contatos-context"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"

export function ContatosTable() {
  const { contatos, loading } = useContatos()

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={contatos}
      searchField="nome"
      searchPlaceholder="Buscar contatos..."
    />
  )
} 