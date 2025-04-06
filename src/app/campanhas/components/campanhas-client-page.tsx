"use client";

import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowLeft } from "lucide-react";
import { CampanhasProvider } from "@/contexts/campanhasContext";
import { ContatosProvider } from "@/contexts/contatosContext";
import { CampanhasCards } from "./client-components";
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
import { CampanhasList } from "./campanhas/campanhas-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CriarCampanha } from "./criar-campanha";
import { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";

export function CampanhasClientPage() {
  const [showCriarCampanha, setShowCriarCampanha] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Carregar o usuário quando o componente montar
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
  }, []);
  
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
                      <BreadcrumbLink href="/campanhas">Início</BreadcrumbLink>
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
              <AnimatePresence mode="wait">
                {showCriarCampanha ? (
                  <motion.div
                    key="criar-campanha"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCriarCampanha(false)}
                          className="mr-2"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <PageHeaderTitle>Nova Campanha</PageHeaderTitle>
                      </div>
                    </div>
                    <Card className="shadow-sm border-muted">
                      <CardContent className="pt-6">
                        <CriarCampanha 
                          onComplete={() => setShowCriarCampanha(false)}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="listar-campanhas"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-4"
                  >
                    <div className="flex items-center justify-between">
                      <PageHeaderTitle>Campanhas</PageHeaderTitle>
                      <Button 
                        onClick={() => setShowCriarCampanha(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Cards de estatísticas */}
                      <Suspense
                        fallback={
                          <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                              <Card key={i} className="h-24 animate-pulse bg-muted" />
                            ))}
                          </div>
                        }
                      >
                        <CampanhasCards />
                      </Suspense>
                      
                      {/* Lista de campanhas */}
                      <Card className="border-muted shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">Campanhas Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Suspense
                            fallback={
                              <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="h-16 rounded-md animate-pulse bg-muted" />
                                ))}
                              </div>
                            }
                          >
                            <CampanhasList />
                          </Suspense>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </CampanhasProvider>
    </ContatosProvider>
  );
} 