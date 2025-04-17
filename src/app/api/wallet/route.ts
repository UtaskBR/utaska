/**
 * API para gerenciamento de carteira
 * 
 * Esta API permite consultar o saldo da carteira do usuário.
 * Implementação completa com Prisma para Vercel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca o saldo do usuário usando Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      },
      select: {
        balance: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Busca as transações recentes usando Prisma
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId: parseInt(userId)
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Retorna o saldo e as transações recentes
    interface Transaction {
      id: number;
      amount: number;
      type: string;
      description: string;
      created_at: string;
    }

    interface WalletResponse {
      balance: number;
      recentTransactions: Transaction[];
    }

    const recentTransactions: Transaction[] = transactions.map((transaction: {
      id: number;
      amount: number;
      type: string;
      description: string;
      createdAt: Date;
    }): Transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      created_at: transaction.createdAt.toISOString()
    }));

    const response: WalletResponse = {
      balance: user.balance || 0,
      recentTransactions
    };

    return NextResponse.json<WalletResponse>(response);
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    // Desconecta o cliente Prisma para evitar conexões pendentes
    await prisma.$disconnect();
  }
}

// Adicione suporte a CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
