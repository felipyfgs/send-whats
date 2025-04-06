"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Campanha } from "@/contexts/campanhasContext";

interface CampanhasContextType {
  campanhas: Campanha[];
  loading: boolean;
  error: Error | null;
  addCampanha: (campanha: Omit<Campanha, "id" | "createdAt" | "updatedAt">) => Promise<Campanha>;
  updateCampanha: (id: string, campanha: Partial<Campanha>) => Promise<Campanha>;
  deleteCampanha: (id: string) => Promise<void>;
  refreshCampanhas: () => Promise<void>;
}

interface CampanhasProviderProps {
  children: ReactNode;
}

const CampanhasContext = createContext<CampanhasContextType | undefined>(undefined);

// Mock data para campanhas
const MOCK_CAMPANHAS: Campanha[] = [
  {
    id: "1",
    title: "Black Friday 2023",
    description: "Campanha promocional para Black Friday",
    status: "rascunho",
    startDate: "2023-11-24T00:00:00",
    endDate: "2023-11-26T23:59:59",
    target: "all",
    contactIds: [],
    tagIds: [],
    createdAt: "2023-10-15T10:00:00",
    updatedAt: "2023-10-15T10:00:00",
  },
  {
    id: "2",
    title: "Newsletter Dezembro",
    description: "Newsletter mensal de dezembro",
    status: "agendada",
    startDate: "2023-12-01T08:00:00",
    endDate: null,
    target: "tags",
    contactIds: [],
    tagIds: ["1", "2"],
    createdAt: "2023-11-20T14:30:00",
    updatedAt: "2023-11-20T14:30:00",
  },
  {
    id: "3",
    title: "Promoção de Verão",
    description: "Campanha para produtos de verão",
    status: "ativa",
    startDate: "2023-01-15T00:00:00",
    endDate: "2023-02-28T23:59:59",
    target: "contacts",
    contactIds: ["1", "3", "5"],
    tagIds: [],
    createdAt: "2023-01-10T09:15:00",
    updatedAt: "2023-01-10T09:15:00",
  },
];

export function CampanhasProvider({ children }: CampanhasProviderProps) {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para carregar campanhas (simulada)
  const refreshCampanhas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usar dados mock
      setCampanhas(MOCK_CAMPANHAS);
    } catch (err) {
      console.error("Erro ao carregar campanhas:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Adicionar campanha (simulada)
  const addCampanha = async (campanha: Omit<Campanha, "id" | "createdAt" | "updatedAt">): Promise<Campanha> => {
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCampanha: Campanha = {
        ...campanha,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCampanhas(prevCampanhas => [...prevCampanhas, newCampanha]);
      
      return newCampanha;
    } catch (err) {
      console.error("Erro ao adicionar campanha:", err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  // Atualizar campanha (simulada)
  const updateCampanha = async (id: string, campanha: Partial<Campanha>): Promise<Campanha> => {
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedCampanha: Campanha | null = null;
      
      setCampanhas(prevCampanhas => 
        prevCampanhas.map(c => {
          if (c.id === id) {
            updatedCampanha = {
              ...c,
              ...campanha,
              updatedAt: new Date().toISOString(),
            };
            return updatedCampanha;
          }
          return c;
        })
      );
      
      if (!updatedCampanha) {
        throw new Error(`Campanha com ID ${id} não encontrada`);
      }
      
      return updatedCampanha;
    } catch (err) {
      console.error("Erro ao atualizar campanha:", err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  // Excluir campanha (simulada)
  const deleteCampanha = async (id: string): Promise<void> => {
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCampanhas(prevCampanhas => prevCampanhas.filter(c => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir campanha:", err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  // Carregar campanhas na inicialização
  useEffect(() => {
    refreshCampanhas();
  }, []);

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

export default CampanhasContext; 