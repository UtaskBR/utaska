/**
 * API para gerenciamento de carteira
 * 
 * Esta API permite consultar o saldo da carteira do usuário.
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

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca o saldo do usuário
    const user = await db
      .prepare('SELECT balance FROM users WHERE id = ?')
      .bind(parseInt(userId))
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Busca as transações recentes
    const transactions = await db
      .prepare(`
        SELECT id, amount, type, description, created_at
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `)
      .bind(parseInt(userId))
      .all();

    // Retorna o saldo e as transações recentes
    return NextResponse.json({
      balance: user.balance || 0,
      recentTransactions: transactions.results
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
