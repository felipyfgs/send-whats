"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  fetchCampanhas, 
  createCampanha, 
  updateCampanha as updateCampanhaApi, 
  deleteCampanha as deleteCampanhaApi,
  fetchGruposContatos,
  atualizarStatusCampanha,
  Campanha as DBCampanha,
  CampanhaInsert,
  CampanhaUpdate,
  StatusCampanha
} from "@/lib/supabase/campanhas";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Adaptar o tipo de campanha para nosso contexto
export interface Campanha {
  id: string;
  title: string; // corresponde a nome no DB
  description: string | null; // corresponde a descricao no DB
  status: StatusCampanha;
  startDate: string | null; // corresponde a data_inicio no DB
  endDate: string | null; // corresponde a data_conclusao no DB
  target: 'all' | 'tags' | 'contacts' | 'custom';
  contactIds: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
  content?: string; // corresponde a conteudo no DB
  teamId?: string | null; // corresponde a team_id no DB
}

interface CampanhasContextType {
  campanhas: Campanha[];
  loading: boolean;
  error: Error | null;
  addCampanha: (campanha: Omit<Campanha, "id" | "createdAt" | "updatedAt">) => Promise<Campanha>;
  updateCampanha: (id: string, campanha: Partial<Campanha>) => Promise<Campanha>;
  deleteCampanha: (id: string) => Promise<void>;
  refreshCampanhas: () => Promise<void>;
  grupos: Array<{ id: string; nome: string; descricao: string | null }>;
  updateCampanhaStatus: (id: string, status: StatusCampanha) => Promise<Campanha>;
}

interface CampanhasProviderProps {
  children: ReactNode;
  user?: User | null;
}

const CampanhasContext = createContext<CampanhasContextType | undefined>(undefined);

// Função para converter formato de DB para formato do app
const mapDbCampanhaToAppCampanha = (dbCampanha: DBCampanha): Campanha => {
  try {
    // Verificação de console para debug
    console.log("Mapeando campanha do DB:", dbCampanha);
    
    // Mapeamento de grupos para IDs de contatos e tags (simplificado)
    const contactIds: string[] = [];
    const tagIds: string[] = [];
    
    // Criamos o objeto de retorno com valores padrão caso algum campo seja undefined
    const campanha: Campanha = {
      id: dbCampanha.id,
      title: dbCampanha.nome || "",
      description: dbCampanha.descricao,
      status: dbCampanha.status || "rascunho",
      startDate: dbCampanha.data_inicio,
      endDate: dbCampanha.data_conclusao,
      target: 'all', // Determinar baseado na lógica de grupos
      contactIds,
      tagIds,
      createdAt: dbCampanha.created_at,
      updatedAt: dbCampanha.updated_at,
      content: dbCampanha.conteudo,
      teamId: dbCampanha.team_id
    };
    
    console.log("Campanha mapeada:", campanha);
    return campanha;
  } catch (error) {
    console.error("Erro ao mapear campanha:", error);
    // Retorna um objeto vazio com valores padrão em caso de erro
    return {
      id: dbCampanha.id || "",
      title: dbCampanha.nome || "Erro no mapeamento",
      description: null,
      status: "rascunho",
      startDate: null,
      endDate: null,
      target: 'all',
      contactIds: [],
      tagIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: "",
      teamId: null
    };
  }
};

// Função para converter formato do app para formato de DB
const mapAppCampanhaToDbInsert = (appCampanha: Omit<Campanha, "id" | "createdAt" | "updatedAt">, userId?: string): CampanhaInsert => {
  // Não exigimos mais um teamId
  return {
    team_id: appCampanha.teamId || null, // Agora é opcional
    nome: appCampanha.title,
    descricao: appCampanha.description,
    conteudo: appCampanha.content || "",
    data_inicio: appCampanha.startDate,
    data_agendamento: appCampanha.endDate,
    status: appCampanha.status as StatusCampanha
  };
};

const mapAppCampanhaToDbUpdate = (appCampanha: Partial<Campanha>): CampanhaUpdate => {
  const update: CampanhaUpdate = {};
  
  if (appCampanha.title !== undefined) update.nome = appCampanha.title;
  if (appCampanha.description !== undefined) update.descricao = appCampanha.description;
  if (appCampanha.content !== undefined) update.conteudo = appCampanha.content;
  if (appCampanha.startDate !== undefined) update.data_inicio = appCampanha.startDate;
  if (appCampanha.endDate !== undefined) update.data_agendamento = appCampanha.endDate;
  if (appCampanha.status !== undefined) update.status = appCampanha.status;
  
  return update;
};

export function CampanhasProvider({ children, user }: CampanhasProviderProps) {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [grupos, setGrupos] = useState<Array<{ id: string; nome: string; descricao: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  // Função para obter ID da equipe do usuário
  const getUserTeamId = async (userId?: string) => {
    if (!userId || !user) return null;
    
    try {
      const supabase = createClient();
      
      // Buscar as equipes que o usuário é membro
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .limit(1);
      
      if (error) {
        console.error("Erro ao buscar equipe do usuário:", error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.warn("Usuário não pertence a nenhuma equipe");
        return null;
      }
      
      return data[0].team_id;
    } catch (err) {
      console.error("Erro ao obter ID da equipe:", err);
      return null;
    }
  };
  
  // Carregar dados na inicialização e quando o usuário mudar
  useEffect(() => {
    const initializeContext = async () => {
      if (user) {
        // Obter ID da equipe do usuário
        const teamId = await getUserTeamId(user.id);
        setUserTeamId(teamId);
        
        // Carregar campanhas
        refreshCampanhas();
      }
    };
    
    initializeContext();
  }, [user]);

  // Função para carregar campanhas do Supabase
  const refreshCampanhas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar campanhas
      const dbCampanhas = await fetchCampanhas();
      console.log("Campanhas carregadas do banco:", dbCampanhas);
      
      if (!dbCampanhas || dbCampanhas.length === 0) {
        console.log("Nenhuma campanha encontrada no banco");
        setCampanhas([]);
      } else {
        try {
          const campanhasMapeadas = dbCampanhas.map(mapDbCampanhaToAppCampanha);
          console.log("Campanhas após mapeamento:", campanhasMapeadas);
          setCampanhas(campanhasMapeadas);
        } catch (mappingError) {
          console.error("Erro ao mapear campanhas:", mappingError);
          setCampanhas([]);
          setError(mappingError instanceof Error ? mappingError : new Error(String(mappingError)));
        }
      }
      
      // Carregar grupos
      const gruposData = await fetchGruposContatos();
      setGrupos(gruposData);
    } catch (err) {
      console.error("Erro ao carregar campanhas:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar campanha
  const addCampanha = async (campanha: Omit<Campanha, "id" | "createdAt" | "updatedAt">): Promise<Campanha> => {
    try {
      setLoading(true);
      
      // Verificar campos obrigatórios
      if (!campanha.title) {
        throw new Error("O título da campanha é obrigatório");
      }
      
      if (!campanha.content) {
        throw new Error("O conteúdo da campanha é obrigatório");
      }
      
      // Não precisamos mais verificar teamId
      const dbCampanha = mapAppCampanhaToDbInsert(campanha, user?.id);
      
      // Grupos IDs baseados em tags e contatos
      let gruposIds: string[] = [];
      
      if (campanha.target === 'all') {
        // Todos os grupos
        gruposIds = grupos.map(g => g.id);
      } else if (campanha.target === 'tags' && campanha.tagIds.length > 0) {
        // Lógica para mapear tags para grupos
        // Por enquanto, usamos todos os grupos disponíveis
        gruposIds = grupos.map(g => g.id);
      } else if (campanha.target === 'contacts' && campanha.contactIds.length > 0) {
        // Lógica para mapear contatos para grupos
        // Por enquanto, usamos todos os grupos disponíveis
        gruposIds = grupos.map(g => g.id);
      }
      
      // Criar campanha no Supabase
      const novaCampanha = await createCampanha(dbCampanha, gruposIds);
      
      // Converter de volta para o formato do app
      const campanhaFormatada = mapDbCampanhaToAppCampanha(novaCampanha);
      
      // Atualizar estado
      setCampanhas(prev => [campanhaFormatada, ...prev]);
      toast.success("Campanha criada com sucesso!");
      
      return campanhaFormatada;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao criar campanha";
      console.error("Erro ao adicionar campanha:", errorMessage, err);
      toast.error(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campanha
  const updateCampanha = async (id: string, campanha: Partial<Campanha>): Promise<Campanha> => {
    try {
      setLoading(true);
      
      // Converter para o formato do DB
      const dbCampanha = mapAppCampanhaToDbUpdate(campanha);
      
      // Atualizar no Supabase
      const campanhaAtualizada = await updateCampanhaApi(id, dbCampanha);
      
      // Converter de volta para o formato do app
      const campanhaFormatada = mapDbCampanhaToAppCampanha(campanhaAtualizada);
      
      // Atualizar estado
      setCampanhas(prev => 
        prev.map(c => c.id === id ? campanhaFormatada : c)
      );
      
      toast.success("Campanha atualizada com sucesso!");
      return campanhaFormatada;
    } catch (err) {
      console.error("Erro ao atualizar campanha:", err);
      toast.error("Erro ao atualizar campanha");
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Excluir campanha
  const deleteCampanha = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Excluir no Supabase
      await deleteCampanhaApi(id);
      
      // Atualizar estado
      setCampanhas(prev => prev.filter(c => c.id !== id));
      toast.success("Campanha excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir campanha:", err);
      toast.error("Erro ao excluir campanha");
      throw err instanceof Error ? err : new Error(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status da campanha
  const updateCampanhaStatus = async (id: string, status: StatusCampanha): Promise<Campanha> => {
    try {
      setLoading(true);
      setError(null);
      
      // Atualizar o status da campanha
      const dbCampanha = await atualizarStatusCampanha(id, status);
      const campanhaMapeada = mapDbCampanhaToAppCampanha(dbCampanha);
      
      // Atualizar a lista de campanhas
      setCampanhas(campanhas => 
        campanhas.map(c => c.id === id ? campanhaMapeada : c)
      );
      
      return campanhaMapeada;
    } catch (err) {
      console.error(`Erro ao atualizar status da campanha ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CampanhasContext.Provider
      value={{
        campanhas,
        loading,
        error,
        addCampanha,
        updateCampanha,
        deleteCampanha,
        refreshCampanhas,
        grupos,
        updateCampanhaStatus
      }}
    >
      {children}
    </CampanhasContext.Provider>
  );
}

export function useCampanhas() {
  const context = useContext(CampanhasContext);
  
  if (context === undefined) {
    throw new Error("useCampanhas deve ser usado dentro de um CampanhasProvider");
  }
  
  return context;
} 