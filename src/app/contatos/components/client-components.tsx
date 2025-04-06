"use client"

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card"
import { Users, User, Briefcase, Tag as TagIcon } from "lucide-react"
import { useContatos } from "@/contexts/contatos-context"

// Componente wrapper cliente para TagsDialog
const DynamicTagsDialogComponent = dynamic(
  () => import("./tags/tags").then(mod => mod.TagsDialog),
  { ssr: false }
);

// Componente exportado com Suspense para evitar erros de renderização
export function DynamicTagsDialog() {
  return (
    <Suspense fallback={null}>
      <DynamicTagsDialogComponent />
    </Suspense>
  );
}

// Cards de estatísticas de contatos
export function ContatosCards() {
  const { contatos, tags, loading } = useContatos()
  
  // Contadores de categorias
  const personalCount = contatos.filter(c => c.category === "personal").length
  const workCount = contatos.filter(c => c.category === "work").length
  const familyCount = contatos.filter(c => c.category === "family").length
  const otherCount = contatos.filter(c => c.category === "other").length
  
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
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 mb-2">
      <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <Users className="h-4 w-4 text-primary mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold -mt-0.5">{contatos.length}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <User className="h-4 w-4 text-blue-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Pessoais</p>
            <p className="text-sm font-semibold -mt-0.5">{personalCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <Briefcase className="h-4 w-4 text-emerald-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Trabalho</p>
            <p className="text-sm font-semibold -mt-0.5">{workCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="px-3 py-1 flex items-center">
          <TagIcon className="h-4 w-4 text-amber-500 mr-2" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Tags</p>
            <p className="text-sm font-semibold -mt-0.5">{tags.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 