"use client"

import { useContatos } from "@/contexts/contatos-context"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"

export function ContatosTable() {
  const { contatos, loading } = useContatos()

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Carregando contatos">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={contatos}
      searchField="nome"
      searchPlaceholder="Buscar contatos..."
      emptyMessage="Nenhum contato encontrado"
    />
  )
} 