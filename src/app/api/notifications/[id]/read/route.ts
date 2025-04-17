/**
 * API para marcar uma notificação como lida
 * 
 * Esta API permite marcar uma notificação específica como lida.
 * Implementação completa com Prisma para Vercel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

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

    // Verifica se a notificação existe e pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      },
      select: {
        id: true,
        userId: true
      }
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    if (notification.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar esta notificação' },
        { status: 403 }
      );
    }

    // Marca a notificação como lida
    await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        read: true
      }
    });

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
