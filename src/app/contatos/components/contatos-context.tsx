"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchContatos, createContato, updateContato, deleteContato, searchContatos } from "@/lib/supabase/database";
import { Contato } from "@/app/contatos/components/types";

interface ContatosContextType {
  contatos: Contato[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addContato: (contato: Omit<Contato, "id">) => Promise<void>;
  updateContato: (id: string, contato: Partial<Contato>) => Promise<void>;
  removeContato: (id: string) => Promise<void>;
  searchContatos: (query: string) => Promise<void>;
  searchQuery: string;
  selectedContatos: string[];
  setSelectedContatos: React.Dispatch<React.SetStateAction<string[]>>;
}

const ContatosContext = createContext<ContatosContextType | undefined>(undefined);

export const ContatosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContatos, setSelectedContatos] = useState<string[]>([]);

  const loadContatos = async () => {
    try {
      setLoading(true);
      const data = await fetchContatos();
      setContatos(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar contatos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar contatos com filtro global
  const buscarContatos = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      
      // Usando a nova função que busca em todas as colunas, incluindo tags
      const results = await searchContatos(query);
      setContatos(results);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar contatos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContatos();
  }, []);

  const addContato = async (contato: Omit<Contato, "id">) => {
    try {
      setLoading(true);
      await createContato(contato);
      await loadContatos();
    } catch (err) {
      setError("Erro ao adicionar contato");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editContato = async (id: string, contato: Partial<Contato>) => {
    try {
      setLoading(true);
      // Combinamos os dados parciais com o ID sem duplicá-lo
      const contatoWithId = {
        ...contato,
        id
      } as Contato;
      
      await updateContato(contatoWithId);
      await loadContatos();
    } catch (err) {
      setError("Erro ao atualizar contato");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeContato = async (id: string) => {
    try {
      setLoading(true);
      await deleteContato(id);
      await loadContatos();
    } catch (err) {
      setError("Erro ao remover contato");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContatosContext.Provider
      value={{
        contatos,
        loading,
        error,
        reload: loadContatos,
        addContato,
        updateContato: editContato,
        removeContato,
        searchContatos: buscarContatos,
        searchQuery,
        selectedContatos,
        setSelectedContatos
      }}
    >
      {children}
    </ContatosContext.Provider>
  );
};

export const useContatos = () => {
  const context = useContext(ContatosContext);
  if (context === undefined) {
    throw new Error("useContatos must be used within a ContatosProvider");
  }
  return context;
};

export default ContatosContext; 