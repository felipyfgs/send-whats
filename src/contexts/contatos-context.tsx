"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Contato, Tag } from "@/app/contatos/components/contatos/columns";
import * as db from "@/lib/supabase/database";
import { useToast } from "@/hooks/use-toast";

interface ContatosContextType {
  // Estado
  contatos: Contato[];
  tags: Tag[];
  selectedContatos: string[];
  loading: boolean;
  
  // Funções de contatos
  getContato: (id: string) => Promise<Contato | null>;
  createContato: (contato: Omit<Contato, "id">) => Promise<void>;
  updateContato: (contato: Contato) => Promise<void>;
  deleteContato: (id: string) => Promise<void>;
  deleteSelectedContatos: () => Promise<void>;
  
  // Funções de tags
  createTag: (tag: Omit<Tag, "id">) => Promise<void>;
  updateTag: (tag: Tag) => Promise<void>;
  deleteTag: (id: string, silent?: boolean) => Promise<void>;
  
  // Funções de seleção
  selectContato: (id: string) => void;
  deselectContato: (id: string) => void;
  toggleContatoSelection: (id: string) => void;
  selectAllContatos: () => void;
  deselectAllContatos: () => void;
  setSelectedContatos: (ids: string[]) => void;
  
  // Funções de tags em massa
  addTagsToSelectedContatos: (tagIds: string[]) => Promise<void>;
  removeTagsFromSelectedContatos: (tagIds: string[]) => Promise<void>;
  
  // Função de recarregamento
  refreshData: () => Promise<void>;
}

const ContatosContext = createContext<ContatosContextType | undefined>(undefined);

export function ContatosProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedContatos, setSelectedContatos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para lidar com erros
  const handleError = (error: unknown, message: string, silent = false) => {
    console.error(`${message}:`, error);
    if (!silent) {
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
    return error;
  };

  // Função auxiliar para exibir mensagens de sucesso
  const showSuccess = (message: string, silent = false) => {
    if (!silent) {
      toast({
        title: "Sucesso",
        description: message
      });
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, []);

  // Carregar contatos e tags do Supabase
  const refreshData = async () => {
    setLoading(true);
    try {
      const [contatosData, tagsData] = await Promise.all([
        db.fetchContatos(),
        db.fetchTags()
      ]);
      setContatos(contatosData);
      setTags(tagsData);
    } catch (error) {
      handleError(error, "Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar contatos
  const getContato = async (id: string) => {
    try {
      return await db.getContato(id);
    } catch (error) {
      handleError(error, "Não foi possível buscar os detalhes do contato.");
      return null;
    }
  };

  const createContato = async (contato: Omit<Contato, "id">) => {
    try {
      await db.createContato(contato);
      showSuccess("Contato criado com sucesso!");
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível criar o contato.");
    }
  };

  const updateContato = async (contato: Contato) => {
    try {
      await db.updateContato(contato);
      showSuccess("Contato atualizado com sucesso!");
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível atualizar o contato.");
    }
  };

  const deleteContato = async (id: string) => {
    try {
      await db.deleteContato(id);
      showSuccess("Contato excluído com sucesso!");
      // Remover da seleção se estiver selecionado
      if (selectedContatos.includes(id)) {
        setSelectedContatos(prev => prev.filter(contatoId => contatoId !== id));
      }
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível excluir o contato.");
    }
  };

  const deleteSelectedContatos = async () => {
    if (selectedContatos.length === 0) return;
    
    try {
      await db.deleteContatos(selectedContatos);
      showSuccess(`${selectedContatos.length} contato(s) excluído(s) com sucesso!`);
      setSelectedContatos([]);
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível excluir os contatos selecionados.");
    }
  };

  // Funções para gerenciar tags
  const createTag = async (tag: Omit<Tag, "id">) => {
    try {
      await db.createTag(tag);
      showSuccess("Tag criada com sucesso!");
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível criar a tag.");
    }
  };

  const updateTag = async (tag: Tag) => {
    try {
      await db.updateTag(tag);
      showSuccess("Tag atualizada com sucesso!");
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível atualizar a tag.");
    }
  };

  const deleteTag = async (id: string, silent = false) => {
    try {
      await db.deleteTag(id);
      showSuccess("Tag excluída com sucesso!", silent);
      await refreshData();
    } catch (error) {
      const err = handleError(error, "Não foi possível excluir a tag.", silent);
      throw err; // Repassar o erro para ser tratado pelo chamador
    }
  };

  // Funções para gerenciar seleção de contatos
  const selectContato = (id: string) => {
    if (!selectedContatos.includes(id)) {
      setSelectedContatos(prev => [...prev, id]);
    }
  };

  const deselectContato = (id: string) => {
    setSelectedContatos(prev => prev.filter(contatoId => contatoId !== id));
  };

  const toggleContatoSelection = (id: string) => {
    if (selectedContatos.includes(id)) {
      deselectContato(id);
    } else {
      selectContato(id);
    }
  };

  const selectAllContatos = () => {
    setSelectedContatos(contatos.map(contato => contato.id));
  };

  const deselectAllContatos = () => {
    setSelectedContatos([]);
  };

  // Funções para gerenciar tags em massa
  const addTagsToSelectedContatos = async (tagIds: string[]) => {
    if (selectedContatos.length === 0 || tagIds.length === 0) return;
    
    try {
      await db.addTagsToContatos(selectedContatos, tagIds);
      showSuccess(`Tags adicionadas a ${selectedContatos.length} contato(s) com sucesso!`);
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível adicionar as tags aos contatos selecionados.");
    }
  };

  const removeTagsFromSelectedContatos = async (tagIds: string[]) => {
    if (selectedContatos.length === 0 || tagIds.length === 0) return;
    
    try {
      await db.removeTagsFromContatos(selectedContatos, tagIds);
      showSuccess(`Tags removidas de ${selectedContatos.length} contato(s) com sucesso!`);
      await refreshData();
    } catch (error) {
      handleError(error, "Não foi possível remover as tags dos contatos selecionados.");
    }
  };

  const value = {
    contatos,
    tags,
    selectedContatos,
    loading,
    
    getContato,
    createContato,
    updateContato,
    deleteContato,
    deleteSelectedContatos,
    
    createTag,
    updateTag,
    deleteTag,
    
    selectContato,
    deselectContato,
    toggleContatoSelection,
    selectAllContatos,
    deselectAllContatos,
    setSelectedContatos,
    
    addTagsToSelectedContatos,
    removeTagsFromSelectedContatos,
    
    refreshData
  };

  return (
    <ContatosContext.Provider value={value}>
      {children}
    </ContatosContext.Provider>
  );
}

export function useContatos() {
  const context = useContext(ContatosContext);
  if (context === undefined) {
    throw new Error("useContatos deve ser usado dentro de um ContatosProvider");
  }
  return context;
} 