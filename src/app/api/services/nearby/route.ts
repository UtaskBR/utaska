/**
 * API para busca de serviços próximos
 * 
 * Esta API permite buscar serviços próximos a uma localização geográfica.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Obtém os parâmetros da URL de forma segura para Edge Runtime
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseInt(url.searchParams.get('radius') || '10', 10);
    
    // Validação dos parâmetros
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórios' },
        { status: 400 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca serviços próximos usando a fórmula de Haversine
    // Nota: Esta é uma implementação simplificada. Para uma solução mais precisa,
    // considere usar uma extensão espacial ou um serviço de geolocalização.
    const services = await db.prepare(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.location,
        s.status,
        s.latitude,
        s.longitude,
        c.id as category_id,
        c.name as category_name,
        u.id as user_id,
        u.name as user_name,
        u.avatar_url,
        (6371 * acos(
          cos(radians(?)) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(?)) + 
          sin(radians(?)) * 
          sin(radians(s.latitude))
        )) AS distance
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.status = 'pending'
      HAVING distance <= ?
      ORDER BY distance
      LIMIT 50
    `).bind(lat, lng, lat, radius).all();

    // Formata os resultados
    const formattedServices = services.results.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      location: service.location,
      status: service.status,
      distance: service.distance * 1000, // Converte km para metros
      category: service.category_id ? {
        id: service.category_id,
        name: service.category_name
      } : null,
      user: service.user_id ? {
        id: service.user_id,
        name: service.user_name,
        avatar_url: service.avatar_url
      } : null
    }));

    // Retorna os serviços
    return NextResponse.json({
      services: formattedServices
    });
  } catch (error) {
    console.error('Erro ao buscar serviços próximos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar serviços próximos' },
      { status: 500 }
    );
  }
}
