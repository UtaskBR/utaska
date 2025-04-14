/**
 * API para verificação do usuário atual
 * 
 * Esta API retorna os dados do usuário autenticado com base no token JWT.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Obtém o ID do usuário do cabeçalho (definido pelo middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca os dados do usuário
    const user = await db
      .prepare('SELECT id, name, email, city, state, avatar_url, balance, created_at FROM users WHERE id = ?')
      .bind(parseInt(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Retorna os dados do usuário
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        state: user.state,
        avatar_url: user.avatar_url,
        balance: user.balance,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
