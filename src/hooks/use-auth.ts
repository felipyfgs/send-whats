"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User, AuthError } from "@supabase/supabase-js";

interface AuthResponse {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Verificar a sessão atual quando o componente é montado
    async function getInitialSession() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        router.refresh();
      }
    );

    // Limpar subscription quando o componente desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  /**
   * Autenticar usuário com email e senha
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Objeto com indicador de sucesso e possível mensagem de erro
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { 
        success: false, 
        error: authError.message 
      };
    }
  };

  /**
   * Finalizar a sessão do usuário atual
   * @returns Objeto com indicador de sucesso e possível mensagem de erro
   */
  const signOut = async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { 
        success: false, 
        error: authError.message 
      };
    }
  };

  /**
   * Registrar um novo usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Objeto com indicador de sucesso e possível mensagem de erro
   */
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return { 
        success: false, 
        error: authError.message 
      };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  };
} 