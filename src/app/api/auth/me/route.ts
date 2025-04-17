/**
 * API para verificação do usuário atual
 * 
 * Esta API retorna os dados do usuário autenticado com base no token JWT.
 * Adaptada para Vercel com Prisma.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

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

    // Busca os dados do usuário usando Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        state: true,
        avatar_url: true,
        balance: true,
        createdAt: true
      }
    });

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
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
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
