// Interface para categorias de contato
export type ContatoCategory = "personal" | "work" | "family" | "other"

// Definição do tipo de dados para tags
export interface Tag {
  id: string
  name: string
  color: string
  description?: string
}

// Estrutura base para contatos (sem ID)
export interface ContatoBase {
  name: string
  email: string | null
  phone: string | null
  category: ContatoCategory
  company: string | null
  role: string | null
  notes: string | null
  tags: Tag[]
}

// Definição do tipo de dados para contatos completos
export interface Contato extends ContatoBase {
  id: string
}

// Interface para criação de contato (sem ID)
export type CreateContatoInput = ContatoBase

// Interface para atualização de contato (com ID)
export type UpdateContatoInput = Contato 