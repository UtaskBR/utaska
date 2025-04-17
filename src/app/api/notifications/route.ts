/**
 * API para notificações
 * 
 * Esta API permite listar as notificações do usuário.
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

    // Obtém os parâmetros da URL
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const unreadOnly = url.searchParams.get('unread') === 'true';

    // Busca as notificações do usuário com Prisma
    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId),
        ...(unreadOnly ? { read: false } : {})
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        relatedId: true,
        read: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Conta o número de notificações não lidas
    const unreadCount = await prisma.notification.count({
      where: {
        userId: parseInt(userId),
        read: false
      }
    });

    // Conta o total de notificações para paginação
    const totalCount = await prisma.notification.count({
      where: {
        userId: parseInt(userId),
        ...(unreadOnly ? { read: false } : {})
      }
    });

    // Retorna as notificações e contagem de não lidas
    interface NotificationResponse {
      id: number;
      type: string;
      title: string;
      message: string;
      related_id: number | null;
      read: boolean;
      created_at: string;
    }

    interface Pagination {
      limit: number;
      offset: number;
      total: number;
    }

    interface NotificationsResponse {
      notifications: NotificationResponse[];
      unreadCount: number;
      pagination: Pagination;
    }

    interface NotificationResponse {
      id: number;
      type: string;
      title: string;
      message: string;
      related_id: number | null;
      read: boolean;
      created_at: string;
    }

    interface Pagination {
      limit: number;
      offset: number;
      total: number;
    }

    interface NotificationsResponse {
      notifications: NotificationResponse[];
      unreadCount: number;
      pagination: Pagination;
    }

    // Define interfaces para os tipos
    interface Notification {
      id: number;
      type: string;
      title: string;
      message: string;
      relatedId: number | null;
      read: boolean;
      createdAt: Date;
    }

    interface NotificationResponse {
      id: number;
      type: string;
      title: string;
      message: string;
      related_id: number | null;
      read: boolean;
      created_at: string;
    }

    interface Pagination {
      limit: number;
      offset: number;
      total: number;
    }

    interface NotificationsResponse {
      notifications: NotificationResponse[];
      unreadCount: number;
      pagination: Pagination;
    }

    return NextResponse.json<NotificationsResponse>({
      notifications: notifications.map((notification: Notification): NotificationResponse => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      related_id: notification.relatedId,
      read: notification.read,
      created_at: notification.createdAt.toISOString()
      })),
      unreadCount: unreadCount,
      pagination: {
      limit,
      offset,
      total: totalCount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
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
