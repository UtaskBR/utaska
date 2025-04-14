/**
 * API para detalhes, atualização e exclusão de um serviço específico
 * 
 * Esta API permite visualizar, atualizar e excluir um serviço específico.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'ID de serviço inválido' },
        { status: 400 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca o serviço pelo ID
    const service = await db
      .prepare(`
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
          s.user_id,
          s.created_at,
          c.id as category_id,
          c.name as category_name,
          u.name as user_name,
          u.avatar_url,
          u.city as user_city,
          u.state as user_state
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `)
      .bind(serviceId)
      .first();

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Busca as propostas para este serviço
    const proposals = await db
      .prepare(`
        SELECT 
          p.id, 
          p.price, 
          p.message, 
          p.status,
          p.created_at,
          u.id as provider_id,
          u.name as provider_name,
          u.avatar_url as provider_avatar
        FROM proposals p
        JOIN users u ON p.provider_id = u.id
        WHERE p.service_id = ?
        ORDER BY p.created_at DESC
      `)
      .bind(serviceId)
      .all();

    // Formata o resultado
    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      location: service.location,
      status: service.status,
      latitude: service.latitude,
      longitude: service.longitude,
      createdAt: service.created_at,
      category: service.category_id ? {
        id: service.category_id,
        name: service.category_name
      } : null,
      user: {
        id: service.user_id,
        name: service.user_name,
        avatar_url: service.avatar_url,
        city: service.user_city,
        state: service.user_state
      },
      proposals: proposals.results.map(p => ({
        id: p.id,
        price: p.price,
        message: p.message,
        status: p.status,
        createdAt: p.created_at,
        provider: {
          id: p.provider_id,
          name: p.provider_name,
          avatar_url: p.provider_avatar
        }
      }))
    };

    // Retorna os dados do serviço
    return NextResponse.json({ service: formattedService });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar serviço' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'ID de serviço inválido' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se o serviço existe e pertence ao usuário
    const existingService = await db
      .prepare('SELECT user_id FROM services WHERE id = ?')
      .bind(serviceId)
      .first();

    if (!existingService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    if (existingService.user_id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para atualizar este serviço' },
        { status: 403 }
      );
    }

    // Obtém o corpo da requisição
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
      longitude
    } = body;

    // Validação dos campos obrigatórios
    if (!title || !description || !price || !date) {
      return NextResponse.json(
        { error: 'Título, descrição, preço e data são obrigatórios' },
        { status: 400 }
      );
    }

    // Atualiza o serviço no banco de dados
    const result = await db
      .prepare(`
        UPDATE services 
        SET 
          title = ?, 
          description = ?, 
          price = ?, 
          date = ?, 
          location = ?, 
          category_id = ?,
          status = ?,
          latitude = ?,
          longitude = ?
        WHERE id = ?
        RETURNING id, title, description, price, date, location, category_id, status, created_at
      `)
      .bind(
        title, 
        description, 
        price, 
        date, 
        location || null, 
        category_id || null,
        status || 'pending',
        latitude || null,
        longitude || null,
        serviceId
      )
      .first();

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao atualizar serviço' },
        { status: 500 }
      );
    }

    // Busca informações da categoria
    let category = null;
    if (result.category_id) {
      const categoryResult = await db
        .prepare('SELECT id, name FROM categories WHERE id = ?')
        .bind(result.category_id)
        .first();
      
      if (categoryResult) {
        category = {
          id: categoryResult.id,
          name: categoryResult.name
        };
      }
    }

    // Retorna os dados do serviço atualizado
    return NextResponse.json({
      service: {
        id: result.id,
        title: result.title,
        description: result.description,
        price: result.price,
        date: result.date,
        location: result.location,
        status: result.status,
        category,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'ID de serviço inválido' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se o serviço existe e pertence ao usuário
    const existingService = await db
      .prepare('SELECT user_id FROM services WHERE id = ?')
      .bind(serviceId)
      .first();

    if (!existingService) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    if (existingService.user_id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este serviço' },
        { status: 403 }
      );
    }

    // Exclui o serviço do banco de dados
    await db
      .prepare('DELETE FROM services WHERE id = ?')
      .bind(serviceId)
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Serviço excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
