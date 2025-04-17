/**
 * Utilitário para autenticação nas APIs
 * 
 * Este arquivo implementa funções para verificação de autenticação
 * nas rotas de API do servidor, compatível com Vercel e Prisma.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './jwt';
import { cookies } from 'next/headers';

/**
 * Verifica se o usuário está autenticado a partir do token JWT
 * @param request Objeto de requisição Next.js
 * @returns ID do usuário se autenticado, null caso contrário
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    // Tenta obter o token do cabeçalho Authorization
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Token do cabeçalho Authorization
      token = authHeader.substring(7);
    } else {
      // Tenta obter o token dos cookies
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value;
    }

    if (!token) {
      return null;
    }

    // Verifica e decodifica o token
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Retorna o ID do usuário como string
    return String(decoded.userId);
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error);
    return null;
  }
}

/**
 * Middleware para verificar autenticação e retornar erro 401 se não autenticado
 * @param request Objeto de requisição Next.js
 * @param handler Função de manipulação da requisição
 */
export async function withAuth(
  request: NextRequest,
  handler: (userId: string, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = await verifyAuth(request);
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }
  
  return handler(userId, request);
}

/**
 * Obtém o ID do usuário a partir do token nos cookies (para uso no cliente)
 * @returns ID do usuário ou null se não autenticado
 */
export function getUserIdFromCookies(): string | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Decodifica o token sem verificar (apenas para obter o ID)
    // A verificação completa deve ser feita no servidor
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return payload.userId ? String(payload.userId) : null;
  } catch (error) {
    console.error('Erro ao obter ID do usuário dos cookies:', error);
    return null;
  }
}
