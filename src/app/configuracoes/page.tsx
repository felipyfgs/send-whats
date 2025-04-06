"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/custom/navigation/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfiguracoesGeral } from "./components/configuracoes-geral"
import { LimitesSettings } from "./components/limites-settings"
import { SegurancaSettings } from "./components/seguranca-settings"
import { ApiSettings } from "./components/api-settings"

// Componente que usa useSearchParams dentro de Suspense
function ConfiguracoesTabProvider() {
  "use client"
  
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  
  // Define a aba padrão com base nos parâmetros da URL ou usa "geral" como padrão
  const defaultTab = tabParam === "limites" || tabParam === "seguranca" || tabParam === "api" 
    ? tabParam 
    : "geral"

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="limites">Limites e Uso</TabsTrigger>
        <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        <TabsTrigger value="api">API WhatsApp</TabsTrigger>
      </TabsList>
      
      <TabsContent value="geral" className="space-y-4">
        <ConfiguracoesGeral />
      </TabsContent>
      <TabsContent value="limites" className="space-y-4">
        <LimitesSettings />
      </TabsContent>
      <TabsContent value="seguranca" className="space-y-4">
        <SegurancaSettings />
      </TabsContent>
      <TabsContent value="api" className="space-y-4">
        <ApiSettings />
      </TabsContent>
    </Tabs>
  )
}

export default function ConfiguracoesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/configuracoes">Início</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Configurações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do seu sistema de campanhas WhatsApp.
            </p>
          </div>
          
          <Suspense fallback={<div>Carregando configurações...</div>}>
            <ConfiguracoesTabProvider />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 