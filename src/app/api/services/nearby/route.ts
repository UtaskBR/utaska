/**
 * API para busca de serviços próximos
 * 
 * Esta API permite buscar serviços próximos a uma localização geográfica.
 * Otimizada para Edge Runtime.
 */

// src/app/api/services/nearby/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Você pode remover esta linha se não quiser mais usar Edge
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseInt(url.searchParams.get('radius') || '10', 10);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return NextResponse.json({ error: 'Latitude e longitude são obrigatórios' }, { status: 400 });
    }

    const radiusKm = radius; // raio em km
    const EARTH_RADIUS = 6371; // raio da Terra em km

    // Serviços com latitude e longitude válidas
    const services = await prisma.service.findMany({
      where: {
        status: 'pending',
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        category: true,
        user: true,
      },
    });

    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return EARTH_RADIUS * c;
    };

    interface Service {
      id: number;
      name: string;
      latitude: number | null;
      longitude: number | null;
      status: string;
      category: object; // Replace with a more specific type if available
      user: object; // Replace with a more specific type if available
    }

    interface NearbyService extends Service {
      distance: number;
    }

    const nearby: NearbyService[] = services
      .map((service: Service) => {
      const distance = haversineDistance(
        lat,
        lng,
        service.latitude || 0,
        service.longitude || 0
      );

      return {
        ...service,
        distance: distance * 1000, // metros
      };
      })
      .filter((service: NearbyService) => service.distance <= radiusKm * 1000)
      .sort((a: NearbyService, b: NearbyService) => a.distance - b.distance)
      .slice(0, 50);

    return NextResponse.json({ services: nearby });
  } catch (error) {
    console.error('Erro ao buscar serviços próximos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

