import { createClient } from "./client";
import { Tag, Contato } from "@/app/contatos/components/columns";

// Interfaces para o banco de dados
export interface DBTag {
  id: string;
  nome: string;
  cor: string;
  created_at?: string;
  updated_at?: string;
}

export interface DBContato {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  categoria: string;
  created_at?: string;
  updated_at?: string;
}

export interface DBContatoTag {
  contato_id: string;
  tag_id: string;
}

// Funções para manipulação de tags
export async function fetchTags(): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tags").select("*");
  
  if (error) {
    console.error("Erro ao buscar tags:", error);
    throw error;
  }
  
  return data.map((tag: DBTag) => ({
    id: tag.id,
    nome: tag.nome,
    cor: tag.cor
  }));
}

export async function createTag(tag: Omit<Tag, "id">): Promise<Tag> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ nome: tag.nome, cor: tag.cor })
    .select()
    .single();
  
  if (error) {
    console.error("Erro ao criar tag:", error);
    throw error;
  }
  
  return {
    id: data.id,
    nome: data.nome,
    cor: data.cor
  };
}

export async function updateTag(tag: Tag): Promise<Tag> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .update({ nome: tag.nome, cor: tag.cor })
    .eq("id", tag.id)
    .select()
    .single();
  
  if (error) {
    console.error("Erro ao atualizar tag:", error);
    throw error;
  }
  
  return {
    id: data.id,
    nome: data.nome,
    cor: data.cor
  };
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Erro ao excluir tag:", error);
    throw error;
  }
}

// Funções para manipulação de contatos
export async function fetchContatos(): Promise<Contato[]> {
  const supabase = createClient();
  
  // Buscar todos os contatos
  const { data: contatos, error: contatosError } = await supabase
    .from("contatos")
    .select("*");
  
  if (contatosError) {
    console.error("Erro ao buscar contatos:", contatosError);
    throw contatosError;
  }
  
  // Buscar todas as tags
  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("*");
  
  if (tagsError) {
    console.error("Erro ao buscar tags:", tagsError);
    throw tagsError;
  }
  
  // Buscar as relações entre contatos e tags
  const { data, error: relError } = await supabase
    .from("contato_tags")
    .select("*");
  
  if (relError) {
    console.error("Erro ao buscar relações contato-tag:", relError);
    throw relError;
  }
  
  // Garantir que o TypeScript reconheça o tipo correto
  const relacoes = data as DBContatoTag[];
  
  // Converter para o formato da aplicação
  return contatos.map((contato: DBContato) => {
    const contatoTagIds = relacoes
      .filter(rel => rel.contato_id === contato.id)
      .map(rel => rel.tag_id);
    
    const contatoTags = tags
      .filter((tag: DBTag) => contatoTagIds.includes(tag.id))
      .map((tag: DBTag) => ({
        id: tag.id,
        nome: tag.nome,
        cor: tag.cor
      }));
    
    return {
      id: contato.id,
      nome: contato.nome,
      email: contato.email || "",
      telefone: contato.telefone || "",
      categoria: contato.categoria as "pessoal" | "trabalho" | "familia" | "outro",
      tags: contatoTags
    };
  });
}

export async function getContato(id: string): Promise<Contato | null> {
  const supabase = createClient();
  
  // Buscar o contato
  const { data: contato, error: contatoError } = await supabase
    .from("contatos")
    .select("*")
    .eq("id", id)
    .single();
  
  if (contatoError) {
    if (contatoError.code === "PGRST116") {
      return null; // Contato não encontrado
    }
    console.error("Erro ao buscar contato:", contatoError);
    throw contatoError;
  }
  
  // Buscar as tags do contato
  const { data, error: relError } = await supabase
    .from("contato_tags")
    .select("tag_id")
    .eq("contato_id", id);
  
  if (relError) {
    console.error("Erro ao buscar tags do contato:", relError);
    throw relError;
  }
  
  // Usar asserção de tipo para garantir que o TypeScript reconheça a estrutura
  const contatoTags = data as { tag_id: string }[];
  
  const tagIds = contatoTags.map(rel => rel.tag_id);
  
  if (tagIds.length === 0) {
    return {
      id: contato.id,
      nome: contato.nome,
      email: contato.email || "",
      telefone: contato.telefone || "",
      categoria: contato.categoria as "pessoal" | "trabalho" | "familia" | "outro",
      tags: []
    };
  }
  
  // Buscar as tags pelos IDs
  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds);
  
  if (tagsError) {
    console.error("Erro ao buscar tags:", tagsError);
    throw tagsError;
  }
  
  return {
    id: contato.id,
    nome: contato.nome,
    email: contato.email || "",
    telefone: contato.telefone || "",
    categoria: contato.categoria as "pessoal" | "trabalho" | "familia" | "outro",
    tags: tags.map((tag: DBTag) => ({
      id: tag.id,
      nome: tag.nome,
      cor: tag.cor
    }))
  };
}

export async function createContato(contato: Omit<Contato, "id">): Promise<Contato> {
  const supabase = createClient();
  
  // Inserir o contato
  const { data: newContato, error: contatoError } = await supabase
    .from("contatos")
    .insert({
      nome: contato.nome,
      email: contato.email || null,
      telefone: contato.telefone || null,
      categoria: contato.categoria
    })
    .select()
    .single();
  
  if (contatoError) {
    console.error("Erro ao criar contato:", contatoError);
    throw contatoError;
  }
  
  // Se tiver tags, criar relações
  if (contato.tags && contato.tags.length > 0) {
    const relations = contato.tags.map((tag) => ({
      contato_id: newContato.id,
      tag_id: tag.id
    }));
    
    const { error: relError } = await supabase
      .from("contato_tags")
      .insert(relations);
    
    if (relError) {
      console.error("Erro ao associar tags ao contato:", relError);
      throw relError;
    }
  }
  
  return {
    id: newContato.id,
    nome: newContato.nome,
    email: newContato.email || "",
    telefone: newContato.telefone || "",
    categoria: newContato.categoria as "pessoal" | "trabalho" | "familia" | "outro",
    tags: contato.tags || []
  };
}

export async function updateContato(contato: Contato): Promise<Contato> {
  const supabase = createClient();
  
  // Atualizar o contato
  const { data: updatedContato, error: contatoError } = await supabase
    .from("contatos")
    .update({
      nome: contato.nome,
      email: contato.email || null,
      telefone: contato.telefone || null,
      categoria: contato.categoria
    })
    .eq("id", contato.id)
    .select()
    .single();
  
  if (contatoError) {
    console.error("Erro ao atualizar contato:", contatoError);
    throw contatoError;
  }
  
  // Remover todas as relações existentes
  const { error: deleteError } = await supabase
    .from("contato_tags")
    .delete()
    .eq("contato_id", contato.id);
  
  if (deleteError) {
    console.error("Erro ao limpar tags do contato:", deleteError);
    throw deleteError;
  }
  
  // Se tiver tags, criar novas relações
  if (contato.tags && contato.tags.length > 0) {
    const relations = contato.tags.map((tag) => ({
      contato_id: contato.id,
      tag_id: tag.id
    }));
    
    const { error: relError } = await supabase
      .from("contato_tags")
      .insert(relations);
    
    if (relError) {
      console.error("Erro ao associar tags ao contato:", relError);
      throw relError;
    }
  }
  
  return {
    id: updatedContato.id,
    nome: updatedContato.nome,
    email: updatedContato.email || "",
    telefone: updatedContato.telefone || "",
    categoria: updatedContato.categoria as "pessoal" | "trabalho" | "familia" | "outro",
    tags: contato.tags || []
  };
}

export async function deleteContato(id: string): Promise<void> {
  const supabase = createClient();
  
  // As relações serão removidas automaticamente pela constraint ON DELETE CASCADE
  const { error } = await supabase
    .from("contatos")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Erro ao excluir contato:", error);
    throw error;
  }
}

export async function addTagsToContatos(contatoIds: string[], tagIds: string[]): Promise<void> {
  if (contatoIds.length === 0 || tagIds.length === 0) return;
  
  const supabase = createClient();
  const relations: DBContatoTag[] = [];
  
  // Criar todas as combinações de contato-tag
  for (const contatoId of contatoIds) {
    for (const tagId of tagIds) {
      relations.push({
        contato_id: contatoId,
        tag_id: tagId
      });
    }
  }
  
  // Inserir as relações ignorando duplicatas
  const { error } = await supabase
    .from("contato_tags")
    .upsert(relations, { onConflict: "contato_id,tag_id" });
  
  if (error) {
    console.error("Erro ao adicionar tags aos contatos:", error);
    throw error;
  }
}

export async function removeTagsFromContatos(contatoIds: string[], tagIds: string[]): Promise<void> {
  if (contatoIds.length === 0 || tagIds.length === 0) return;
  
  const supabase = createClient();
  
  // Remover as relações
  const { error } = await supabase
    .from("contato_tags")
    .delete()
    .in("contato_id", contatoIds)
    .in("tag_id", tagIds);
  
  if (error) {
    console.error("Erro ao remover tags dos contatos:", error);
    throw error;
  }
}

export async function deleteContatos(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  
  const supabase = createClient();
  
  // As relações serão removidas automaticamente pela constraint ON DELETE CASCADE
  const { error } = await supabase
    .from("contatos")
    .delete()
    .in("id", ids);
  
  if (error) {
    console.error("Erro ao excluir contatos em massa:", error);
    throw error;
  }
} 