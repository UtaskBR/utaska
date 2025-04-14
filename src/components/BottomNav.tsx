"use client";

/**
 * Componente BottomNav
 * 
 * Este componente implementa a navegação inferior para dispositivos móveis.
 * Otimizado para Edge Runtime.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiSearch, FiMap, FiPlus, FiUser } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Se não houver usuário logado e não estiver em uma das páginas públicas, não exibe a navegação
  if (!user && !['/login', '/register', '/', '/search', '/map'].includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/') ? 'text-utask-blue' : 'text-gray-500'
          }`}
        >
          <FiHome size={20} />
          <span className="mt-1 text-xs">Início</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/search') ? 'text-utask-blue' : 'text-gray-500'
          }`}
        >
          <FiSearch size={20} />
          <span className="mt-1 text-xs">Buscar</span>
        </Link>

        {user && (
          <Link
            href="/create"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/create') ? 'text-utask-blue' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 mb-1 text-white bg-utask-blue rounded-full">
              <FiPlus size={24} />
            </div>
          </Link>
        )}

        <Link
          href="/map"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/map') ? 'text-utask-blue' : 'text-gray-500'
          }`}
        >
          <FiMap size={20} />
          <span className="mt-1 text-xs">Mapa</span>
        </Link>

        {user ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/profile') ? 'text-utask-blue' : 'text-gray-500'
            }`}
          >
            <FiUser size={20} />
            <span className="mt-1 text-xs">Perfil</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/login') ? 'text-utask-blue' : 'text-gray-500'
            }`}
          >
            <FiUser size={20} />
            <span className="mt-1 text-xs">Entrar</span>
          </Link>
        )}
      </div>
    </div>
  );
}
