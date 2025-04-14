/**
 * API para notificações
 * 
 * Esta API permite listar as notificações do usuário.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obtém os parâmetros da URL de forma segura para Edge Runtime
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Constrói a consulta SQL base
    let query = `
      SELECT id, type, title, message, related_id, read, created_at
      FROM notifications
      WHERE user_id = ?
    `;
    
    // Array para armazenar os parâmetros da consulta
    const params: any[] = [parseInt(userId)];

    // Adiciona filtro por não lidas, se solicitado
    if (unreadOnly) {
      query += " AND read = 0";
    }
    
    // Adiciona ordenação e paginação
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Prepara e executa a consulta
    let stmt = db.prepare(query);
    
    // Adiciona os parâmetros à consulta
    for (let i = 0; i < params.length; i++) {
      stmt = stmt.bind(params[i]);
    }
    
    // Executa a consulta
    const notifications = await stmt.all();

    // Conta o número de notificações não lidas
    const unreadCount = await db
      .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0')
      .bind(parseInt(userId))
      .first();

    // Retorna as notificações e contagem de não lidas
    return NextResponse.json({
      notifications: notifications.results,
      unreadCount: unreadCount ? unreadCount.count : 0,
      pagination: {
        limit,
        offset,
        total: notifications.results.length // Nota: Isso não é o total real, apenas o número de resultados retornados
      }
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
