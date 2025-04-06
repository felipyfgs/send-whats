import { Suspense } from "react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampanhasProvider } from "@/contexts/campanhasContext";
import { ContatosProvider } from "@/contexts/contatosContext";
import { CampanhasCards, DynamicCampanhaDialog } from "./components/client-components";
import { AppSidebar } from "@/components/custom/navigation/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "@/components/custom/page-header";
import { CampanhasList } from "./components/campanhas/campanhas-list";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Campanhas | Marketing App",
  description: "Gerencie suas campanhas de marketing",
};

// Função para lidar com autenticação ao lado do servidor
async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function CampanhasPage() {
  const user = await getUser();

  return (
    <ContatosProvider>
      <CampanhasProvider user={user}>
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
                      <BreadcrumbPage>Campanhas</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <PageHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <PageHeaderTitle>Campanhas</PageHeaderTitle>
                    <PageHeaderDescription>
                      Gerencie e monitore suas campanhas de marketing
                    </PageHeaderDescription>
                  </div>
                  <PageHeaderActions>
                    <DynamicCampanhaDialog
                      triggerButton={
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Campanha
                        </Button>
                      }
                    />
                  </PageHeaderActions>
                </div>
              </PageHeader>

              <Suspense
                fallback={
                  <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="h-28 animate-pulse" />
                    ))}
                  </div>
                }
              >
                <CampanhasCards />
              </Suspense>

              <div className="mt-4">
                <Suspense
                  fallback={
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-28 animate-pulse" />
                      ))}
                    </div>
                  }
                >
                  <CampanhasList />
                </Suspense>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </CampanhasProvider>
    </ContatosProvider>
  );
}

