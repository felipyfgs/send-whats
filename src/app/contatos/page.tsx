import { Metadata } from "next"
import { AppSidebar } from "@/components/app-sidebar"
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

import { ContatosTable } from "./components/contatos/contatos-table"
import { ContatosProvider } from "@/contexts/contatos-context"
import { ContatosActions } from "./components/contatos/contatos-actions"
import { TagManagerFab } from "./components/tags/tag-manager-fab"

export const metadata: Metadata = {
  title: "Contatos | Meu App",
  description: "Gerencie seus contatos de forma simples e eficiente"
}

export default function ContatosPage() {
  return (
    <ContatosProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">Início</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Contatos</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4">
              <ContatosActions />
              <div className="rounded-lg border bg-card p-6">
                <ContatosTable />
              </div>
            </div>
            <TagManagerFab />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ContatosProvider>
  )
}
