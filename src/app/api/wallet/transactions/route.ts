/**
 * API para transações da carteira
 * 
 * Esta API permite listar as transações da carteira do usuário.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Use 'nodejs' no runtime se quiser evitar o Edge (recomendado para Prisma)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    const userId = parseInt(userIdHeader || '', 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const type = url.searchParams.get('type') as 'credit' | 'debit' | undefined;

    const whereClause: any = { userId };
    if (type) whereClause.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

