/**
 * API para propostas de um serviço específico
 * 
 * Esta API permite criar propostas para um serviço específico.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);
    const providerId = request.headers.get('x-user-id');

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'ID de serviço inválido' },
        { status: 400 }
      );
    }

    if (!providerId) {
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

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se o serviço existe
    const service = await db
      .prepare('SELECT id, user_id, status FROM services WHERE id = ?')
      .bind(serviceId)
      .first();

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o serviço está disponível para propostas
    if (service.status !== 'pending') {
      return NextResponse.json(
        { error: 'Este serviço não está aceitando propostas' },
        { status: 400 }
      );
    }

    // Verifica se o usuário não está fazendo proposta para seu próprio serviço
    if (service.user_id === parseInt(providerId)) {
      return NextResponse.json(
        { error: 'Você não pode fazer uma proposta para seu próprio serviço' },
        { status: 400 }
      );
    }

    // Verifica se o usuário já fez uma proposta para este serviço
    const existingProposal = await db
      .prepare('SELECT id FROM proposals WHERE service_id = ? AND provider_id = ?')
      .bind(serviceId, parseInt(providerId))
      .first();

    if (existingProposal) {
      return NextResponse.json(
        { error: 'Você já fez uma proposta para este serviço' },
        { status: 400 }
      );
    }

    // Insere a proposta no banco de dados
    const result = await db
      .prepare(`
        INSERT INTO proposals (service_id, provider_id, price, message, status) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING id, service_id, provider_id, price, message, status, created_at
      `)
      .bind(
        serviceId,
        parseInt(providerId),
        price,
        message || '',
        'pending'
      )
      .first();

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao criar proposta' },
        { status: 500 }
      );
    }

    // Busca informações do provedor
    const provider = await db
      .prepare('SELECT id, name, avatar_url FROM users WHERE id = ?')
      .bind(parseInt(providerId))
      .first();

    // Cria uma notificação para o dono do serviço
    await db
      .prepare(`
        INSERT INTO notifications (user_id, type, title, message, related_id, read) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        service.user_id,
        'new_proposal',
        'Nova proposta recebida',
        `Você recebeu uma nova proposta para o serviço "${service.title || 'Serviço'}"`,
        result.id,
        0
      )
      .run();

    // Retorna os dados da proposta criada
    return NextResponse.json({
      proposal: {
        id: result.id,
        serviceId: result.service_id,
        price: result.price,
        message: result.message,
        status: result.status,
        createdAt: result.created_at,
        provider: provider ? {
          id: provider.id,
          name: provider.name,
          avatar_url: provider.avatar_url
        } : null
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se o serviço existe
    const service = await db
      .prepare('SELECT id, user_id FROM services WHERE id = ?')
      .bind(serviceId)
      .first();

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o usuário é o dono do serviço (apenas o dono pode ver todas as propostas)
    const isOwner = userId && service.user_id === parseInt(userId);

    // Busca as propostas para este serviço
    let proposalsQuery = `
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
    `;

    // Se não for o dono, só pode ver suas próprias propostas
    if (!isOwner && userId) {
      proposalsQuery += " AND p.provider_id = ?";
    }

    proposalsQuery += " ORDER BY p.created_at DESC";

    let proposals;
    if (!isOwner && userId) {
      proposals = await db
        .prepare(proposalsQuery)
        .bind(serviceId, parseInt(userId))
        .all();
    } else {
      proposals = await db
        .prepare(proposalsQuery)
        .bind(serviceId)
        .all();
    }

    // Formata o resultado
    const formattedProposals = proposals.results.map(p => ({
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
    }));

    // Retorna as propostas
    return NextResponse.json({
      proposals: formattedProposals
    });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}
