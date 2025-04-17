/**
 * API para aceitar uma proposta
 * 
 * Esta API permite que o dono de um serviço aceite uma proposta.
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
        { error: 'Você não tem permissão para aceitar esta proposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta já foi aceita, rejeitada ou cancelada
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta proposta não pode ser aceita' },
        { status: 400 }
      );
    }

    // Usa uma transação do Prisma para garantir a integridade dos dados
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualiza o status da proposta para 'accepted'
      const updatedProposal = await tx.proposal.update({
        where: {
          id: proposalId
        },
        data: {
          status: 'accepted'
        }
      });

      // 2. Atualiza o status do serviço para 'in_progress'
      await tx.service.update({
        where: {
          id: proposal.serviceId
        },
        data: {
          status: 'in_progress'
        }
      });

      // 3. Rejeita todas as outras propostas para este serviço
      await tx.proposal.updateMany({
        where: {
          serviceId: proposal.serviceId,
          id: {
            not: proposalId
          }
        },
        data: {
          status: 'rejected'
        }
      });

      // 4. Cria uma notificação para o provedor
      await tx.notification.create({
        data: {
          userId: proposal.providerId,
          type: 'proposal_accepted',
          title: 'Proposta aceita',
          message: `Sua proposta para o serviço "${proposal.service.title}" foi aceita!`,
          relatedId: proposalId,
          read: false
        }
      });

      return updatedProposal;
    });

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Proposta aceita com sucesso',
      proposal: {
        id: result.id,
        status: 'accepted'
      }
    });
  } catch (error) {
    console.error('Erro ao aceitar proposta:', error);
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
