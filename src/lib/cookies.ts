"use client";

/**
 * Utilitário para cookies no cliente
 * 
 * Este arquivo implementa funções para manipulação de cookies no navegador,
 * usado principalmente para armazenar o token de autenticação.
 * Utiliza a biblioteca js-cookie que é compatível com Edge Runtime.
 */

import Cookies from 'js-cookie';

// Configurações padrão para cookies
const DEFAULT_OPTIONS = {
  expires: 7, // 7 dias
  path: '/',
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production'
};

/**
 * Define um cookie no navegador
 * @param name Nome do cookie
 * @param value Valor do cookie
 * @param options Opções adicionais (opcional)
 */
export function setCookie(name: string, value: string, options = {}) {
  Cookies.set(name, value, { ...DEFAULT_OPTIONS, ...options });
}

/**
 * Obtém o valor de um cookie
 * @param name Nome do cookie
 * @returns Valor do cookie ou undefined se não existir
 */
export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

/**
 * Remove um cookie
 * @param name Nome do cookie
 * @param options Opções adicionais (opcional)
 */
export function removeCookie(name: string, options = {}) {
  Cookies.remove(name, { ...options, path: '/' });
}

/**
 * Define o token de autenticação como cookie
 * @param token Token JWT
 */
export function setAuthToken(token: string) {
  setCookie('token', token);
}

/**
 * Obtém o token de autenticação do cookie
 * @returns Token JWT ou undefined se não existir
 */
export function getAuthToken(): string | undefined {
  return getCookie('token');
}

/**
 * Remove o token de autenticação
 */
export function removeAuthToken() {
  removeCookie('token');
}
