import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'ID de serviço inválido' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        proposals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                // avatar_url: true, // descomente se estiver usando esse campo
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'ID de serviço inválido' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    if (existingService.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para atualizar este serviço' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      date,
      location,
      category_id,
      status,
      latitude,
      longitude,
    } = body;

    if (!title || !description || !price || !date) {
      return NextResponse.json(
        { error: 'Título, descrição, preço e data são obrigatórios' },
        { status: 400 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        budget: price,
        status,
        createdAt: new Date(date),
        location,
        latitude,
        longitude,
        category: category_id ? { connect: { id: category_id } } : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json({ service: updatedService });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'ID de serviço inválido' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    if (service.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este serviço' },
        { status: 403 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Serviço excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
