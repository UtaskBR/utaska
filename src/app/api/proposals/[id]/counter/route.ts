/**
 * API para fazer uma contraproposta
 * 
 * Esta API permite que o dono de um serviço faça uma contraproposta.
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

    // Obtém o corpo da requisição
    const body = await request.json();
    const { price, message } = body;

    // Validação dos campos obrigatórios
    if (!price) {
      return NextResponse.json(
        { error: 'Preço é obrigatório' },
        { status: 400 }
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
        { error: 'Você não tem permissão para fazer uma contraproposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta está pendente
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Não é possível fazer uma contraproposta para esta proposta' },
        { status: 400 }
      );
    }

    // Usa uma transação do Prisma para garantir a integridade dos dados
    interface CounterProposalData {
      price: number;
      message: string;
      status: 'counter';
    }

    interface NotificationData {
      userId: number;
      type: string;
      title: string;
      message: string;
      relatedId: number;
      read: boolean;
    }

    const result = await prisma.$transaction(async (tx: PrismaClient): Promise<CounterProposalData> => {
      // Atualiza a proposta com o novo preço e mensagem, e muda o status para 'counter'
      const updatedProposal = await tx.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        price: price,
        message: message || '',
        status: 'counter'
      }
      });

      // Cria uma notificação para o provedor
      const notificationData: NotificationData = {
      userId: proposal.providerId,
      type: 'counter_proposal',
      title: 'Contraproposta recebida',
      message: `Você recebeu uma contraproposta para o serviço "${proposal.service.title}"`,
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
      message: 'Contraproposta enviada com sucesso',
      proposal: {
        id: result.id,
        price: result.price,
        message: result.message,
        status: 'counter'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar contraproposta:', error);
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
