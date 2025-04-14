"use client";

/**
 * Utilitário para requisições HTTP
 * 
 * Este arquivo implementa um cliente HTTP para comunicação com a API,
 * incluindo tratamento de autenticação e erros.
 * Otimizado para Edge Runtime.
 */

import { getAuthToken, removeAuthToken } from './cookies';

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Opções para requisições
export interface RequestOptions extends RequestInit {
  authenticated?: boolean;
  handleError?: boolean;
}

// URL base da API (em produção, deve ser uma variável de ambiente)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Realiza uma requisição HTTP para a API
 * @param endpoint Endpoint da API (sem a URL base)
 * @param options Opções da requisição
 * @returns Resposta da API tipada
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      authenticated = false,
      handleError = true,
      headers = {},
      ...restOptions
    } = options;

    // Prepara os headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Adiciona o token de autenticação se necessário
    if (authenticated) {
      const token = getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Constrói a URL completa
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    // Realiza a requisição
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });

    // Tenta parsear a resposta como JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      // Se for erro de autenticação, remove o token
      if (response.status === 401 && authenticated) {
        removeAuthToken();
        
        // Redireciona para a página de login se estiver no cliente
        if (typeof window !== 'undefined') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }

      // Lança um erro com os detalhes da resposta
      throw {
        status: response.status,
        message: data.error || response.statusText,
        data,
      };
    }

    // Retorna os dados e o status
    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    // Trata o erro
    if (options.handleError) {
      console.error('API request error:', error);
    }

    // Retorna o erro formatado
    return {
      error: error.message || 'Erro desconhecido',
      status: error.status || 500,
    };
  }
}

/**
 * Realiza uma requisição GET
 * @param endpoint Endpoint da API
 * @param options Opções da requisição
 * @returns Resposta da API tipada
 */
export function get<T = any>(endpoint: string, options: RequestOptions = {}) {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * Realiza uma requisição POST
 * @param endpoint Endpoint da API
 * @param data Dados a serem enviados
 * @param options Opções da requisição
 * @returns Resposta da API tipada
 */
export function post<T = any>(endpoint: string, data: any, options: RequestOptions = {}) {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Realiza uma requisição PUT
 * @param endpoint Endpoint da API
 * @param data Dados a serem enviados
 * @param options Opções da requisição
 * @returns Resposta da API tipada
 */
export function put<T = any>(endpoint: string, data: any, options: RequestOptions = {}) {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Realiza uma requisição DELETE
 * @param endpoint Endpoint da API
 * @param options Opções da requisição
 * @returns Resposta da API tipada
 */
export function del<T = any>(endpoint: string, options: RequestOptions = {}) {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}
