/**
 * API para transações da carteira
 * 
 * Esta API permite listar as transações da carteira do usuário.
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
    const type = url.searchParams.get('type'); // 'credit' ou 'debit'

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Constrói a consulta SQL base
    let query = `
      SELECT id, amount, type, description, created_at
      FROM wallet_transactions
      WHERE user_id = ?
    `;
    
    // Array para armazenar os parâmetros da consulta
    const params: any[] = [parseInt(userId)];

    // Adiciona filtro por tipo, se fornecido
    if (type) {
      query += " AND type = ?";
      params.push(type);
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
    const transactions = await stmt.all();

    // Busca o total de transações para paginação
    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?')
      .bind(parseInt(userId))
      .first();

    // Retorna as transações e informações de paginação
    return NextResponse.json({
      transactions: transactions.results,
      pagination: {
        total: countResult ? countResult.total : 0,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
