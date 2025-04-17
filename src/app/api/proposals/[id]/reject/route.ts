/**
 * API para rejeitar uma proposta
 * 
 * Esta API permite que o dono de um serviço rejeite uma proposta.
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
    const proposalId = parseInt(params.id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(proposalId)) {
      return NextResponse.json(
        { error: 'ID de proposta inválido' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca a proposta e o serviço relacionado usando Prisma
    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId
      },
      include: {
        service: true
      }
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se o usuário é o dono do serviço
    if (proposal.service.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para rejeitar esta proposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta já foi aceita, rejeitada ou cancelada
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta proposta não pode ser rejeitada' },
        { status: 400 }
      );
    }

    // Usa uma transação do Prisma para garantir a integridade dos dados
    interface UpdatedProposal {
      id: number;
      status: string;
    }

    interface NotificationData {
      userId: number;
      type: string;
      title: string;
      message: string;
      relatedId: number;
      read: boolean;
    }

    const result: UpdatedProposal = await prisma.$transaction(async (tx: PrismaClient): Promise<UpdatedProposal> => {
      // Atualiza o status da proposta para 'rejected'
      const updatedProposal: UpdatedProposal = await tx.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        status: 'rejected'
      }
      });

      // Cria uma notificação para o provedor
      const notificationData: NotificationData = {
      userId: proposal.providerId,
      type: 'proposal_rejected',
      title: 'Proposta rejeitada',
      message: `Sua proposta para o serviço "${proposal.service.title}" foi rejeitada.`,
      relatedId: proposalId,
      read: false
      };

      await tx.notification.create({
      data: notificationData
      });

      return updatedProposal;
    });

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Proposta rejeitada com sucesso',
      proposal: {
        id: result.id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Erro ao rejeitar proposta:', error);
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
