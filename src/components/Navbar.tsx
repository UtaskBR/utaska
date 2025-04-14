"use client";

/**
 * Componente Navbar
 * 
 * Este componente implementa a barra de navegação principal da aplicação.
 * Otimizado para Edge Runtime.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Função para alternar o menu mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  // Função para alternar o menu de perfil
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-utask-blue">UTASK</span>
            </Link>
          </div>

          {/* Links de navegação (desktop) */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                }`}
              >
                Início
              </Link>
              <Link
                href="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/search') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                }`}
              >
                Buscar
              </Link>
              <Link
                href="/map"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/map') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                }`}
              >
                Mapa
              </Link>
              {user && (
                <Link
                  href="/create"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/create') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Criar Serviço
                </Link>
              )}
            </div>
          </div>

          {/* Botões de ação (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notificações */}
                <Link
                  href="/notifications"
                  className="p-2 text-gray-600 rounded-full hover:bg-gray-100 relative"
                >
                  <FiBell size={20} />
                  {/* Indicador de notificações não lidas (exemplo) */}
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                {/* Menu de perfil */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center text-gray-600 focus:outline-none"
                  >
                    <div className="relative w-8 h-8 overflow-hidden bg-utask-blue rounded-full">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown de perfil */}
                  {isProfileOpen && (
                    <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiUser className="mr-2" />
                          Meu Perfil
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="mr-2">💰</span>
                          Carteira
                        </Link>
                        <Link
                          href="/agenda"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="mr-2">📅</span>
                          Agenda
                        </Link>
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiLogOut className="mr-2" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-utask-blue hover:text-utask-blue-dark"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-utask-blue rounded-md hover:bg-utask-blue-dark"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Botão do menu mobile */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
              }`}
            >
              Início
            </Link>
            <Link
              href="/search"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/search') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
              }`}
            >
              Buscar
            </Link>
            <Link
              href="/map"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/map') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
              }`}
            >
              Mapa
            </Link>
            {user && (
              <>
                <Link
                  href="/create"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/create') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Criar Serviço
                </Link>
                <Link
                  href="/notifications"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/notifications') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Notificações
                </Link>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/profile') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/wallet"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/wallet') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Carteira
                </Link>
                <Link
                  href="/agenda"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/agenda') ? 'text-utask-blue' : 'text-gray-600 hover:text-utask-blue'
                  }`}
                >
                  Agenda
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  Sair
                </button>
              </>
            )}
            {!user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-utask-blue border border-utask-blue rounded-md hover:bg-utask-blue-light"
                  >
                    Entrar
                  </Link>
                </div>
                <div className="mt-3 px-5">
                  <Link
                    href="/register"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-utask-blue rounded-md hover:bg-utask-blue-dark"
                  >
                    Cadastrar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
