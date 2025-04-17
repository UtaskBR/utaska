/**
 * API para propostas de um serviço específico
 * 
 * Esta API permite criar propostas para um serviço específico.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const providerId = request.headers.get('x-user-id');

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'ID de serviço inválido' }, { status: 400 });
    }

    if (!providerId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { price, message } = body;

    if (!price) {
      return NextResponse.json({ error: 'Preço é obrigatório' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    if (service.status !== 'pending') {
      return NextResponse.json({ error: 'Este serviço não está aceitando propostas' }, { status: 400 });
    }

    if (service.userId === parseInt(providerId)) {
      return NextResponse.json({ error: 'Você não pode fazer uma proposta para seu próprio serviço' }, { status: 400 });
    }

    const existingProposal = await prisma.proposal.findFirst({
      where: {
        serviceId,
        userId: parseInt(providerId),
      },
    });

    if (existingProposal) {
      return NextResponse.json({ error: 'Você já fez uma proposta para este serviço' }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        serviceId,
        userId: parseInt(providerId),
        amount: price,
        description: message || '',
        status: 'pending',
      },
      include: {
        user: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: service.userId,
        message: `Você recebeu uma nova proposta para o serviço "${service.title}"`,
        read: false,
      },
    });

    return NextResponse.json({
      proposal: {
        id: proposal.id,
        serviceId: proposal.serviceId,
        price: proposal.amount,
        message: proposal.description,
        status: proposal.status,
        createdAt: proposal.createdAt,
        provider: {
          id: proposal.user.id,
          name: proposal.user.name,
          avatar_url: '', // ajuste se necessário
        },
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

