"use client"

// Definição do tipo de dados para tags
export type Tag = {
  id: string
  nome: string
  cor: string
}

// Definição do tipo de dados para contatos
export type Contato = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  categoria: "pessoal" | "trabalho" | "familia" | "outro"
  tags: Tag[]
  empresa: string | null
  cargo: string | null
  observacoes: string | null
} 