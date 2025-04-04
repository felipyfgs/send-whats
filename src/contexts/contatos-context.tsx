"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Contato, Tag } from "@/app/contatos/components/columns";
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
  deleteTag: (id: string) => Promise<void>;
  
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
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar contatos
  const getContato = async (id: string) => {
    try {
      return await db.getContato(id);
    } catch (error) {
      console.error("Erro ao buscar contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os detalhes do contato.",
        variant: "destructive"
      });
      return null;
    }
  };

  const createContato = async (contato: Omit<Contato, "id">) => {
    try {
      await db.createContato(contato);
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!"
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao criar contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o contato.",
        variant: "destructive"
      });
    }
  };

  const updateContato = async (contato: Contato) => {
    try {
      await db.updateContato(contato);
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato.",
        variant: "destructive"
      });
    }
  };

  const deleteContato = async (id: string) => {
    try {
      await db.deleteContato(id);
      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso!"
      });
      // Remover da seleção se estiver selecionado
      if (selectedContatos.includes(id)) {
        setSelectedContatos(prev => prev.filter(contatoId => contatoId !== id));
      }
      await refreshData();
    } catch (error) {
      console.error("Erro ao excluir contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato.",
        variant: "destructive"
      });
    }
  };

  const deleteSelectedContatos = async () => {
    if (selectedContatos.length === 0) return;
    
    try {
      await db.deleteContatos(selectedContatos);
      toast({
        title: "Sucesso",
        description: `${selectedContatos.length} contato(s) excluído(s) com sucesso!`
      });
      setSelectedContatos([]);
      await refreshData();
    } catch (error) {
      console.error("Erro ao excluir contatos em massa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os contatos selecionados.",
        variant: "destructive"
      });
    }
  };

  // Funções para gerenciar tags
  const createTag = async (tag: Omit<Tag, "id">) => {
    try {
      await db.createTag(tag);
      toast({
        title: "Sucesso",
        description: "Tag criada com sucesso!"
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag.",
        variant: "destructive"
      });
    }
  };

  const updateTag = async (tag: Tag) => {
    try {
      await db.updateTag(tag);
      toast({
        title: "Sucesso",
        description: "Tag atualizada com sucesso!"
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tag.",
        variant: "destructive"
      });
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await db.deleteTag(id);
      toast({
        title: "Sucesso",
        description: "Tag excluída com sucesso!"
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao excluir tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tag.",
        variant: "destructive"
      });
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
      toast({
        title: "Sucesso",
        description: `Tags adicionadas a ${selectedContatos.length} contato(s) com sucesso!`
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao adicionar tags em massa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar as tags aos contatos selecionados.",
        variant: "destructive"
      });
    }
  };

  const removeTagsFromSelectedContatos = async (tagIds: string[]) => {
    if (selectedContatos.length === 0 || tagIds.length === 0) return;
    
    try {
      await db.removeTagsFromContatos(selectedContatos, tagIds);
      toast({
        title: "Sucesso",
        description: `Tags removidas de ${selectedContatos.length} contato(s) com sucesso!`
      });
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover tags em massa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover as tags dos contatos selecionados.",
        variant: "destructive"
      });
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