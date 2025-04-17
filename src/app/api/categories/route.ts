/**
 * API para categorias de serviços
 * 
 * Esta API permite listar todas as categorias de serviços disponíveis.
 * Adaptada para Vercel com Prisma.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Busca todas as categorias usando Prisma
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Retorna as categorias
    return NextResponse.json({
      categories: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
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
