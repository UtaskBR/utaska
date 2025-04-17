// src/app/api/services/nearby/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Indicar explicitamente que esta rota é dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const distance = url.searchParams.get('distance') || '10'; // Padrão: 10km
    
    // Validar parâmetros
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Converter para números
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(distance);
    
    // Buscar serviços próximos
    // Nota: Esta é uma implementação simplificada. Para uma busca geoespacial real,
    // você precisaria usar recursos específicos do seu banco de dados.
    const services = await prisma.service.findMany({
      where: {
        // Filtros de localização seriam implementados aqui
        // Este é apenas um exemplo simplificado
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços próximos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar serviços próximos' },
      { status: 500 }
    );
  }
}
