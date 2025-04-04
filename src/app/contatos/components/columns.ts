import { ColumnDef } from "@tanstack/react-table"

export interface Tag {
  id: string
  nome: string
  cor: string
}

export interface Contato {
  id: string
  nome: string
  email: string | null
  telefone: string
  empresa: string | null
  cargo: string | null
  observacoes: string | null
  status?: string
  tags?: Tag[]
  // Campo categoria mantido para compatibilidade (pode ser removido depois)
  categoria?: never  
}

export const columns: ColumnDef<Contato>[] = [
  // ... mantém as colunas existentes ...
]
