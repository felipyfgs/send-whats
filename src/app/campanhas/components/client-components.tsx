"use client"

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card"
import { FileSpreadsheet, Calendar, Megaphone, Tag as TagIcon } from "lucide-react"
import { useCampanhas } from "@/contexts/campanhasContext"
import { useContatos } from "@/contexts/contatosContext"
import { Campanha } from "@/contexts/campanhasContext";

// Componente wrapper cliente para CampanhaDialog
const DynamicCampanhaDialogComponent = dynamic(
  () => import("./campanhas/campanha-dialog").then(mod => mod.CampanhaDialog),
  { ssr: false }
);

// Componente exportado com Suspense para evitar erros de renderização
interface DynamicCampanhaDialogProps {
  triggerButton?: React.ReactNode;
  campanha?: Campanha;
  mode?: "create" | "edit" | "view";
}

export function DynamicCampanhaDialog({ triggerButton, campanha, mode = "create" }: DynamicCampanhaDialogProps) {
  return (
    <Suspense fallback={null}>
      <DynamicCampanhaDialogComponent 
        triggerButton={triggerButton} 
        campanha={campanha}
        mode={mode}
      />
    </Suspense>
  );
}

// Cards de estatísticas de campanhas
export function CampanhasCards() {
  const { campanhas, loading } = useCampanhas()
  const { tags, contatos } = useContatos()
  
  // Contadores de status
  const rascunhoCount = campanhas.filter(c => c.status === "rascunho").length
  const ativaCount = campanhas.filter(c => c.status === "ativa").length
  const agendadaCount = campanhas.filter(c => c.status === "agendada").length
  
  // Se estiver carregando, mostra placeholders
  if (loading) {
    return (
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 mb-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-8 animate-pulse bg-muted/20" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 mb-2" suppressHydrationWarning>
      <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <FileSpreadsheet className="h-4 w-4 text-primary mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold -mt-0.5">{campanhas.length}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <Megaphone className="h-4 w-4 text-green-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Ativas</p>
            <p className="text-sm font-semibold -mt-0.5">{ativaCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <Calendar className="h-4 w-4 text-blue-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Agendadas</p>
            <p className="text-sm font-semibold -mt-0.5">{agendadaCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <TagIcon className="h-4 w-4 text-amber-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Contatos</p>
            <p className="text-sm font-semibold -mt-0.5">{contatos.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 