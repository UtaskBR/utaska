/**
 * API para marcar todas as notificações como lidas
 * 
 * Esta API permite marcar todas as notificações do usuário como lidas.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Marca todas as notificações do usuário como lidas
    await db
      .prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0')
      .bind(parseInt(userId))
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
