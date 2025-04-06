import { User, Briefcase, Users, HeartHandshake } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContatoCategory } from "../components/types"
import { LucideIcon } from "lucide-react"
import React from "react"

// Mapeamento de categorias (inglês para português)
export const categoryLabels: Record<ContatoCategory, string> = {
  personal: "Pessoal",
  work: "Trabalho",
  family: "Família",
  other: "Outro"
}

// Função para mapear categorias em inglês para português
export function mapCategoryToPt(category: ContatoCategory): "pessoal" | "trabalho" | "familia" | "outro" {
  const mapping = {
    personal: "pessoal",
    work: "trabalho",
    family: "familia",
    other: "outro"
  } as const
  
  return mapping[category]
}

// Interface para categorias em português
export type ContatoCategoriaPt = "pessoal" | "trabalho" | "familia" | "outro";

// Interface para definir a estrutura dos ícones de categoria
export interface CategoryIconType {
  icon: LucideIcon;
  color: string;
}

// Define type mappings for lucide icons
export const categoryIcons: Record<ContatoCategoriaPt, CategoryIconType> = {
  pessoal: {
    icon: User,
    color: "text-blue-500",
  },
  trabalho: {
    icon: Briefcase,
    color: "text-green-500",
  },
  familia: {
    icon: Users,
    color: "text-purple-500",
  },
  outro: {
    icon: HeartHandshake,
    color: "text-orange-500",
  },
}; 