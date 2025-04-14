/**
 * Middleware principal da aplicação
 * 
 * Este arquivo implementa o middleware do Next.js para proteção de rotas
 * e verificação de autenticação em toda a aplicação.
 * Otimizado para Edge Runtime.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

// Configuração para Edge Runtime
export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - Arquivos estáticos (_next, static, imagens, etc)
     * - Rotas de erro (404, 500, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|api).*)',
  ],
};

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/categories'
];

// Rotas de API que começam com estes prefixos e não precisam de autenticação
const publicApiPrefixes = [
  '/api/services',  // Listagem de serviços é pública
  '/api/search'     // Busca é pública
];

/**
 * Função de middleware do Next.js
 * Intercepta todas as requisições e verifica autenticação quando necessário
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se a rota é pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Verifica se é uma rota de API pública
  if (publicApiPrefixes.some(prefix => pathname.startsWith(prefix)) && request.method === 'GET') {
    return NextResponse.next();
  }
  
  // Verifica se o usuário está autenticado
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    // Se for uma rota de API, retorna erro 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }
    
    // Se for uma rota de página, redireciona para login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verifica se o token é válido
    const decoded = await verifyJWT(token);
    
    if (!decoded) {
      throw new Error('Token inválido');
    }
    
    // Adiciona o usuário ao cabeçalho da requisição para uso nas APIs
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId.toString());
    
    // Continua com a requisição
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Remove o cookie inválido
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('token');
    return response;
  }
}

/**
 * Configuração de quais rotas o middleware deve interceptar
 */
