import { Contato, Tag } from "../types"

// Tags de exemplo
export const tags: Tag[] = [
  { id: "t1", nome: "Cliente", cor: "#4f46e5" },
  { id: "t2", nome: "Fornecedor", cor: "#0ea5e9" },
  { id: "t3", nome: "Importante", cor: "#ef4444" },
  { id: "t4", nome: "Parceiro", cor: "#10b981" },
  { id: "t5", nome: "Inativo", cor: "#6b7280" },
  { id: "t6", nome: "Novo", cor: "#f59e0b" },
  { id: "t7", nome: "VIP", cor: "#8b5cf6" },
]

export const contatos: Contato[] = [
  {
    id: "c1",
    nome: "João Silva",
    email: "joao.silva@exemplo.com",
    telefone: "(11) 98765-4321",
    categoria: "pessoal",
    tags: [tags[2], tags[6]], // Importante, VIP
    empresa: null,
    cargo: null,
    observacoes: "Contato pessoal importante"
  },
  {
    id: "c2",
    nome: "Maria Oliveira",
    email: "maria@empresa.com.br",
    telefone: "(21) 97654-3210",
    categoria: "trabalho",
    tags: [tags[0], tags[3]], // Cliente, Parceiro
    empresa: "Empresa ABC",
    cargo: "Gerente de Projetos",
    observacoes: null
  },
  {
    id: "c3",
    nome: "Carlos Santos",
    email: "carlos.santos@exemplo.com",
    telefone: "(31) 96543-2109",
    categoria: "familia",
    tags: [],
    empresa: null,
    cargo: null,
    observacoes: "Primo"
  },
  {
    id: "c4",
    nome: "Ana Costa",
    email: "ana.costa@empresa.com.br",
    telefone: "(41) 95432-1098",
    categoria: "trabalho",
    tags: [tags[1]], // Fornecedor
    empresa: "Suprimentos XYZ",
    cargo: "Diretora Comercial",
    observacoes: null
  },
  {
    id: "c5",
    nome: "Pedro Souza",
    email: "pedro.souza@exemplo.com",
    telefone: "(51) 94321-0987",
    categoria: "pessoal",
    tags: [tags[4]], // Inativo
    empresa: null,
    cargo: null,
    observacoes: "Não responde há meses"
  },
  {
    id: "c6",
    nome: "Lucia Ferreira",
    email: "lucia@empresa.com.br",
    telefone: "(61) 93210-9876",
    categoria: "trabalho",
    tags: [tags[0], tags[3], tags[6]], // Cliente, Parceiro, VIP
    empresa: "Tech Solutions",
    cargo: "CEO",
    observacoes: "Cliente prioritário"
  },
  {
    id: "c7",
    nome: "Roberto Almeida",
    email: "roberto@exemplo.com",
    telefone: "(71) 92109-8765",
    categoria: "familia",
    tags: [tags[5]], // Novo
    empresa: null,
    cargo: null,
    observacoes: "Irmão"
  },
  {
    id: "c8",
    nome: "Fernanda Lima",
    email: "fernanda.lima@exemplo.com",
    telefone: "(81) 91098-7654",
    categoria: "outro",
    tags: [tags[3], tags[5]], // Parceiro, Novo
    empresa: "Consultoria Lima",
    cargo: "Consultora",
    observacoes: null
  }
] 