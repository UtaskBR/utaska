"use client";

/**
 * Componente AuthContext
 * 
 * Este componente implementa o contexto de autenticação da aplicação,
 * fornecendo informações do usuário logado e funções de autenticação
 * para todos os componentes filhos.
 * Otimizado para Edge Runtime.
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/cookies';
import { get, post } from '@/lib/api';

// Interface para o usuário
export interface User {
  id: number;
  name: string;
  email: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  balance?: number;
  createdAt?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

// Interface para dados de registro
interface RegisterData {
  name: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
}

// Criação do contexto com valor padrão
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: async () => false,
});

// Provedor do contexto de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Efeito para verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verifica se existe um token
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Busca os dados do usuário
        const response = await get('/api/auth/me', { authenticated: true });

        if (response.error) {
          throw new Error(response.error);
        }

        setUser(response.data.user);
      } catch (err: any) {
        console.error('Erro ao verificar autenticação:', err);
        removeAuthToken();
        setError(err.message || 'Erro ao verificar autenticação');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Função para login do usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns true se o login foi bem-sucedido, false caso contrário
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await post('/api/auth/login', { email, password });

      if (response.error) {
        throw new Error(response.error);
      }

      // Armazena o token e os dados do usuário
      setAuthToken(response.data.token);
      setUser(response.data.user);

      return true;
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      setError(err.message || 'Credenciais inválidas');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para registro de novo usuário
   * @param userData Dados do usuário para registro
   * @returns true se o registro foi bem-sucedido, false caso contrário
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await post('/api/auth/register', userData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Armazena o token e os dados do usuário
      setAuthToken(response.data.token);
      setUser(response.data.user);

      return true;
    } catch (err: any) {
      console.error('Erro ao registrar:', err);
      setError(err.message || 'Erro ao criar conta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para logout do usuário
   */
  const logout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/login');
  };

  /**
   * Função para atualizar dados do usuário
   * @param userData Dados do usuário para atualização
   * @returns true se a atualização foi bem-sucedida, false caso contrário
   */
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await post('/api/users/profile', userData, { authenticated: true });

      if (response.error) {
        throw new Error(response.error);
      }

      setUser(prev => prev ? { ...prev, ...response.data.user } : response.data.user);
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
