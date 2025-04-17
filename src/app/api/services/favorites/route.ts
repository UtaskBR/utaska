// Este arquivo contém a implementação da API de serviços favoritos
// Salve como app/api/services/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// API para listar serviços favoritos do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar serviços favoritos do usuário
    const favorites = await prisma.favoriteService.findMany({
      where: {
        userId: userId
      },
      include: {
        service: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                rating: true,
                reviewCount: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Erro ao buscar serviços favoritos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar serviços favoritos' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// API para adicionar um serviço aos favoritos
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();
    const { serviceId } = data;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já está nos favoritos
    const existingFavorite = await prisma.favoriteService.findFirst({
      where: {
        userId: userId,
        serviceId: serviceId
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Serviço já está nos favoritos' },
        { status: 400 }
      );
    }

    // Adicionar aos favoritos
    const favorite = await prisma.favoriteService.create({
      data: {
        userId: userId,
        serviceId: serviceId
      }
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar serviço aos favoritos:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar serviço aos favoritos' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Suporte a CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
