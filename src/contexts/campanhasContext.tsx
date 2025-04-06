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
  mediaAttachments?: Array<{
    type: 'image' | 'audio' | 'video' | 'file';
    name: string;
    size: string;
    url?: string;
  }>;
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
      teamId: dbCampanha.team_id,
      mediaAttachments: dbCampanha.media_attachments || []
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
      teamId: null,
      mediaAttachments: []
    };
  }
};

// Converter campanha do formato do app para formato do DB
const mapCampanhaToDb = (campanha: Partial<Campanha>): CampanhaInsert => {
  return {
    nome: campanha.title || "",
    descricao: campanha.description || null,
    conteudo: campanha.content || "",
    data_inicio: campanha.startDate || null,
    data_agendamento: null, // definido em casos específicos
    status: campanha.status as StatusCampanha || "rascunho",
    team_id: campanha.teamId || null,
    media_attachments: campanha.mediaAttachments || []
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
  if (appCampanha.mediaAttachments !== undefined) update.media_attachments = appCampanha.mediaAttachments;
  
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
      
      // Criar objeto de campanha no formato do DB
      const dbCampanha = mapCampanhaToDb(campanha);
      
      // Determinar os IDs de grupos conforme o target
      let gruposIds: string[] = [];
      if (campanha.target === 'tags') {
        gruposIds = campanha.tagIds || [];
      } else if (campanha.target === 'contacts') {
        gruposIds = campanha.contactIds || [];
      }
      
      // Aqui seria feito o upload de arquivos de mídia para um serviço de armazenamento
      // e então obter as URLs permanentes para salvar no banco de dados
      if (campanha.mediaAttachments && campanha.mediaAttachments.length > 0) {
        // Simulação de upload - em um caso real, isso seria uma requisição para um serviço
        // como Supabase Storage, AWS S3, etc.
        console.log("Simulando upload de anexos:", campanha.mediaAttachments.length, "arquivos");
        // dbCampanha.media_attachments seria atualizado com as URLs permanentes
      }
      
      // Chamar API para criar campanha
      const result = await createCampanha(dbCampanha, gruposIds);
      
      // Mapear resultado de volta para formato da aplicação
      const newCampanha = mapDbCampanhaToAppCampanha(result);
      
      // Atualizar estado
      setCampanhas(prev => [newCampanha, ...prev]);
      toast.success("Campanha criada com sucesso!");
      
      return newCampanha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao criar campanha";
      console.error("Erro ao adicionar campanha:", errorMessage, err);
      toast.error(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campanha existente
  const updateCampanha = async (id: string, campanha: Partial<Campanha>): Promise<Campanha> => {
    try {
      setLoading(true);
      
      // Verificar se a campanha existe
      const existingCampanhaIndex = campanhas.findIndex(c => c.id === id);
      if (existingCampanhaIndex === -1) {
        throw new Error(`Campanha com ID ${id} não encontrada`);
      }
      
      // Converter para formato do DB
      const dbCampanha = mapAppCampanhaToDbUpdate(campanha);
      
      // Determinar IDs de grupos se necessário
      let gruposIds: string[] | undefined = undefined;
      if (campanha.target !== undefined) {
        gruposIds = [];
        if (campanha.target === 'tags' && campanha.tagIds) {
          gruposIds = campanha.tagIds;
        } else if (campanha.target === 'contacts' && campanha.contactIds) {
          gruposIds = campanha.contactIds;
        }
      }
      
      // Processar anexos de mídia se necessário
      if (campanha.mediaAttachments && campanha.mediaAttachments.length > 0) {
        // Em um caso real, aqui seria feito o upload dos novos arquivos
        // e atualização das URLs no objeto dbCampanha.media_attachments
        console.log("Simulando upload de anexos atualizados:", campanha.mediaAttachments.length, "arquivos");
      }
      
      // Atualizar no Supabase
      const updatedCampanha = await updateCampanhaApi(id, dbCampanha, gruposIds);
      
      // Converter para formato do app
      const mappedCampanha = mapDbCampanhaToAppCampanha(updatedCampanha);
      
      // Atualizar estado local
      setCampanhas(prev => prev.map(c => c.id === id ? mappedCampanha : c));
      
      return mappedCampanha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao atualizar campanha";
      console.error("Erro ao atualizar campanha:", errorMessage, err);
      toast.error(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
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