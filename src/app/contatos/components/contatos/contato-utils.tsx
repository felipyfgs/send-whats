import { User, Briefcase, Users, HeartHandshake } from "lucide-react"
import { cn } from "@/lib/utils"

// Componente que retorna o ícone apropriado para a categoria do contato
export function ContatoCategoriaIcon({ 
  categoria, 
  className 
}: { 
  categoria: "pessoal" | "trabalho" | "familia" | "outro" 
  className?: string 
}) {
  switch (categoria) {
    case "pessoal":
      return <User className={cn(className)} />
    case "trabalho":
      return <Briefcase className={cn(className)} />
    case "familia":
      return <Users className={cn(className)} />
    case "outro":
      return <HeartHandshake className={cn(className)} />
    default:
      return <User className={cn(className)} />
  }
} 