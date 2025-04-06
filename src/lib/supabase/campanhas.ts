import { createClient } from "@/lib/supabase/client";

export type StatusCampanha = 'rascunho' | 'agendada' | 'ativa' | 'pausada' | 'concluida' | 'cancelada';

export interface MediaAttachment {
  type: 'image' | 'audio' | 'video' | 'file';
  name: string;
  size: string;
  url?: string;
}

export interface Campanha {
  id: string;
  team_id: string | null; 
  nome: string;
  descricao: string | null;
  conteudo: string;
  data_inicio: string | null;
  data_agendamento: string | null;
  data_conclusao: string | null;
  status: StatusCampanha;
  created_at: string;
  updated_at: string;
  media_attachments?: MediaAttachment[];
  grupos?: GrupoCampanha[];
}

export interface CampanhaInsert {
  team_id?: string | null;
  nome: string;
  descricao?: string | null;
  conteudo: string;
  data_inicio?: string | null;
  data_agendamento?: string | null;
  status?: StatusCampanha;
  media_attachments?: MediaAttachment[];
}

export interface CampanhaUpdate {
  nome?: string;
  descricao?: string | null;
  conteudo?: string;
  data_inicio?: string | null;
  data_agendamento?: string | null;
  data_conclusao?: string | null;
  status?: StatusCampanha;
  media_attachments?: MediaAttachment[];
}

export interface GrupoCampanha {
  id: string;
  campanha_id: string;
  grupo_id: string;
  grupo?: {
    id: string;
    nome: string;
    descricao: string | null;
  };
}

/**
 * Busca todas as campanhas
 */
export async function fetchCampanhas() {
  const supabase = createClient();
  
  console.log("Buscando campanhas no banco de dados...");
  const { data, error } = await supabase
    .from('campanhas')
    .select(`
      *,
      grupos:campanhas_grupos(
        id,
        grupo_id,
        grupo:grupos_contatos(id, nome, descricao)
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar campanhas:', error);
    throw new Error(error.message);
  }
  
  console.log("Campanhas encontradas no banco:", data?.length || 0, "registros");
  console.log("Dados das campanhas:", data);
  
  return data as Campanha[];
}

/**
 * Busca uma campanha pelo ID
 */
export async function fetchCampanhaPorId(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('campanhas')
    .select(`
      *,
      grupos:campanhas_grupos(
        id,
        grupo_id,
        grupo:grupos_contatos(id, nome, descricao)
      )
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Erro ao buscar campanha com ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data as Campanha;
}

/**
 * Cria uma nova campanha
 */
export async function createCampanha(campanha: CampanhaInsert, grupos_ids?: string[]) {
  const supabase = createClient();
  
  // Inserir a campanha
  const { data, error } = await supabase
    .from('campanhas')
    .insert(campanha)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar campanha:', error);
    throw new Error(error.message);
  }
  
  // Se houver grupos, insere as relações
  if (grupos_ids && grupos_ids.length > 0 && data.id) {
    const relacionamentos = grupos_ids.map(grupo_id => ({
      campanha_id: data.id,
      grupo_id
    }));
    
    const { error: relError } = await supabase
      .from('campanhas_grupos')
      .insert(relacionamentos);
      
    if (relError) {
      console.error('Erro ao associar grupos à campanha:', relError);
      // Não abortamos a operação, apenas logamos o erro
    }
  }
  
  return data as Campanha;
}

/**
 * Atualiza uma campanha existente
 */
export async function updateCampanha(id: string, campanha: CampanhaUpdate, grupos_ids?: string[]) {
  const supabase = createClient();
  
  // Atualizar a campanha
  const { data, error } = await supabase
    .from('campanhas')
    .update({ ...campanha, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Erro ao atualizar campanha com ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  // Se houver grupos, atualiza as relações
  if (grupos_ids !== undefined) {
    // Primeiro remove todos os relacionamentos existentes
    const { error: delError } = await supabase
      .from('campanhas_grupos')
      .delete()
      .eq('campanha_id', id);
      
    if (delError) {
      console.error('Erro ao remover grupos da campanha:', delError);
      // Não abortamos a operação, apenas logamos o erro
    }
    
    // Se houver novos grupos, insere as novas relações
    if (grupos_ids.length > 0) {
      const relacionamentos = grupos_ids.map(grupo_id => ({
        campanha_id: id,
        grupo_id
      }));
      
      const { error: relError } = await supabase
        .from('campanhas_grupos')
        .insert(relacionamentos);
        
      if (relError) {
        console.error('Erro ao associar novos grupos à campanha:', relError);
        // Não abortamos a operação, apenas logamos o erro
      }
    }
  }
  
  return data as Campanha;
}

/**
 * Atualiza o status de uma campanha
 */
export async function atualizarStatusCampanha(id: string, status: StatusCampanha) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('campanhas')
    .update({ 
      status, 
      updated_at: new Date().toISOString(),
      ...(status === 'ativa' ? { data_inicio: new Date().toISOString() } : {}),
      ...(status === 'concluida' ? { data_conclusao: new Date().toISOString() } : {})
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Erro ao atualizar status da campanha com ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data as Campanha;
}

/**
 * Exclui uma campanha
 */
export async function deleteCampanha(id: string) {
  const supabase = createClient();
  
  // Primeiro exclui as relações com grupos
  const { error: relError } = await supabase
    .from('campanhas_grupos')
    .delete()
    .eq('campanha_id', id);
    
  if (relError) {
    console.error(`Erro ao excluir relações da campanha com ID ${id}:`, relError);
    // Não abortamos a operação, apenas logamos o erro
  }
  
  // Agora exclui a campanha
  const { error } = await supabase
    .from('campanhas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Erro ao excluir campanha com ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return true;
}

/**
 * Busca grupos de contatos disponíveis
 */
export async function fetchGruposContatos() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('grupos_contatos')
    .select('*')
    .order('nome');
    
  if (error) {
    console.error('Erro ao buscar grupos de contatos:', error);
    throw new Error(error.message);
  }
  
  return data;
} 