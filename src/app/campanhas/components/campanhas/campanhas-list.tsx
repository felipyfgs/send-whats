"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCampanhas } from "@/contexts/campanhasContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StatusCampanha } from "@/lib/supabase/campanhas";

// Tipo de tab para filtrar campanhas
type CampanhaTab = "todas" | StatusCampanha;

export function CampanhasList() {
  const { campanhas, loading, refreshCampanhas, updateCampanhaStatus, deleteCampanha } = useCampanhas();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CampanhaTab>("todas");

  // Log para debug
  console.log("CampanhasList - campanhas recebidas:", campanhas);
  console.log("CampanhasList - estado de loading:", loading);

  // Verificar se as campanhas estão vazias ou indefinidas
  const hasCampanhas = Array.isArray(campanhas) && campanhas.length > 0;
  console.log("CampanhasList - hasCampanhas:", hasCampanhas);
  
  // Efeito para forçar a recarga de campanhas quando o componente montar
  useEffect(() => {
    console.log("CampanhasList montado - recarregando campanhas");
    refreshCampanhas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removendo refreshCampanhas das dependências para evitar loop infinito

  // Filtrar campanhas com base na tab selecionada
  const campanhasFiltradas = useMemo(() => {
    if (activeTab === "todas") return campanhas;
    return campanhas.filter(campanha => campanha.status === activeTab);
  }, [campanhas, activeTab]);

  // Handler para iniciar uma campanha
  const handleStart = async (id: string) => {
    try {
      setActionLoading(id);
      await updateCampanhaStatus(id, 'ativa');
      toast.success("Campanha iniciada com sucesso!");
    } catch (error) {
      console.error("Erro ao iniciar campanha:", error);
      toast.error("Erro ao iniciar a campanha");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler para pausar uma campanha
  const handlePause = async (id: string) => {
    try {
      setActionLoading(id);
      await updateCampanhaStatus(id, 'pausada');
      toast.success("Campanha pausada com sucesso!");
    } catch (error) {
      console.error("Erro ao pausar campanha:", error);
      toast.error("Erro ao pausar a campanha");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler para concluir uma campanha
  const handleComplete = async (id: string) => {
    try {
      setActionLoading(id);
      await updateCampanhaStatus(id, 'concluida');
      toast.success("Campanha concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao concluir campanha:", error);
      toast.error("Erro ao concluir a campanha");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteCampanha(confirmDelete);
      toast.success("Campanha excluída com sucesso!");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir a campanha");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    console.log("CampanhasList - Renderizando estado de loading");
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-28 animate-pulse bg-muted/20" />
        ))}
      </div>
    );
  }

  if (!hasCampanhas) {
    console.log("CampanhasList - Renderizando estado vazio");
    return (
      <Card className="bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-center text-muted-foreground">Nenhuma campanha encontrada</p>
        </CardContent>
      </Card>
    );
  }

  // Contador de campanhas por status para mostrar nos filtros
  const contadores = {
    todas: campanhas.length,
    rascunho: campanhas.filter(c => c.status === 'rascunho').length,
    agendada: campanhas.filter(c => c.status === 'agendada').length,
    ativa: campanhas.filter(c => c.status === 'ativa').length,
    pausada: campanhas.filter(c => c.status === 'pausada').length,
    concluida: campanhas.filter(c => c.status === 'concluida').length,
    cancelada: campanhas.filter(c => c.status === 'cancelada').length,
  };

  console.log("CampanhasList - Renderizando lista de campanhas, quantidade:", campanhasFiltradas.length);
  
  return (
    <div className="space-y-4" suppressHydrationWarning>
      <h2 className="text-xl font-bold">Lista de Campanhas</h2>
      
      <Tabs defaultValue="todas" value={activeTab} onValueChange={(value) => setActiveTab(value as CampanhaTab)} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="todas">
            Todas <span className="ml-1 text-xs text-muted-foreground">({contadores.todas})</span>
          </TabsTrigger>
          <TabsTrigger value="rascunho">
            Rascunho <span className="ml-1 text-xs text-muted-foreground">({contadores.rascunho})</span>
          </TabsTrigger>
          <TabsTrigger value="agendada">
            Agendadas <span className="ml-1 text-xs text-muted-foreground">({contadores.agendada})</span>
          </TabsTrigger>
          <TabsTrigger value="ativa">
            Ativas <span className="ml-1 text-xs text-muted-foreground">({contadores.ativa})</span>
          </TabsTrigger>
          <TabsTrigger value="pausada">
            Pausadas <span className="ml-1 text-xs text-muted-foreground">({contadores.pausada})</span>
          </TabsTrigger>
          <TabsTrigger value="concluida">
            Concluídas <span className="ml-1 text-xs text-muted-foreground">({contadores.concluida})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelada">
            Canceladas <span className="ml-1 text-xs text-muted-foreground">({contadores.cancelada})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="rascunho" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="agendada" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="ativa" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="pausada" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="concluida" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
        
        <TabsContent value="cancelada" className="space-y-3">
          {renderCampanhasList(campanhasFiltradas)}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A campanha será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded">
        Debug: {JSON.stringify({filtro: activeTab, total: campanhas.length, filtradas: campanhasFiltradas.length, loading}, null, 2)}
      </pre>
    </div>
  );

  // Função auxiliar para renderizar a lista de campanhas
  function renderCampanhasList(campanhas: typeof campanhasFiltradas) {
    if (campanhas.length === 0) {
      return (
        <Card className="bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">Nenhuma campanha encontrada neste filtro</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {campanhas.map((campanha) => {
          console.log("Renderizando campanha:", campanha.id, campanha.title);
          const isLoading = actionLoading === campanha.id;
          
          return (
            <Card key={campanha.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle>{campanha.title || "Sem título"}</CardTitle>
                <p className="text-sm text-muted-foreground">Status: 
                  <span className={`ml-1 font-medium ${campanha.status === 'ativa' ? 'text-green-500' : 
                    campanha.status === 'pausada' ? 'text-amber-500' : 
                    campanha.status === 'concluida' ? 'text-blue-500' : 
                    campanha.status === 'cancelada' ? 'text-red-500' : 'text-gray-500'}`}>
                    {campanha.status === 'ativa' ? 'Ativa' : 
                     campanha.status === 'pausada' ? 'Pausada' : 
                     campanha.status === 'agendada' ? 'Agendada' : 
                     campanha.status === 'concluida' ? 'Concluída' : 
                     campanha.status === 'cancelada' ? 'Cancelada' : 'Rascunho'}
                  </span>
                </p>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2 pt-0">
                {campanha.status !== 'ativa' && campanha.status !== 'concluida' && campanha.status !== 'cancelada' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleStart(campanha.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Iniciando...</>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar
                      </>
                    )}
                  </Button>
                )}
                
                {campanha.status === 'ativa' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleComplete(campanha.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>Concluindo...</>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Concluir
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => handlePause(campanha.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>Pausando...</>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(campanha.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }
} 