"use client";

/**
 * Hook useAuth
 * 
 * Este hook personalizado fornece acesso ao contexto de autenticação
 * de forma simplificada para os componentes.
 * Otimizado para Edge Runtime.
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
