import type { Metadata } from "next"
import { AppSidebar } from "@/components/custom/navigation/app-sidebar"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import ContatosTable from "./components/contatos/contatos-table"
import { ContatosProvider } from "@/contexts/contatos-context"
import { ContatoDialog } from "./components/contatos/contato-dialog"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ContatosCards, DynamicTagsDialog } from "./components/client-components"

export const metadata: Metadata = {
  title: "Contatos | Gerenciamento de Contatos",
  description: "Visualize, adicione e gerencie seus contatos",
}

export default function ContatosPage() {
  return (
    <ContatosProvider>
      {/* Componente do diálogo de tags - deve ser o primeiro para inicializar corretamente */}
      <DynamicTagsDialog />
      
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
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

            
            {/* Cards de estatísticas */}
            <ContatosCards />
            
            <div className="bg-card rounded-lg border shadow-sm flex-1 overflow-hidden">
              <ContatosTable />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ContatosProvider>
  )
}
