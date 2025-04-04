"use client"

// Definição do tipo de dados para tags
export type Tag = {
  id: string
  name: string
  color: string
}

// Definição do tipo de dados para contatos
export type Contato = {
  id: string
  name: string
  email: string | null
  phone: string | null
  category: "personal" | "work" | "family" | "other"
  tags: Tag[]
  company: string | null
  role: string | null
  notes: string | null
} 