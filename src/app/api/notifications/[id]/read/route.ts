/**
 * API para marcar uma notificação como lida
 * 
 * Esta API permite marcar uma notificação específica como lida.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = parseInt(params.id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'ID de notificação inválido' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se a notificação existe e pertence ao usuário
    const notification = await db
      .prepare('SELECT id, user_id FROM notifications WHERE id = ?')
      .bind(notificationId)
      .first();

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    if (notification.user_id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar esta notificação' },
        { status: 403 }
      );
    }

    // Marca a notificação como lida
    await db
      .prepare('UPDATE notifications SET read = 1 WHERE id = ?')
      .bind(notificationId)
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
