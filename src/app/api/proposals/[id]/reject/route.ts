/**
 * API para rejeitar uma proposta
 * 
 * Esta API permite que o dono de um serviço rejeite uma proposta.
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

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca a proposta e o serviço relacionado
    const proposal = await db
      .prepare(`
        SELECT 
          p.id, 
          p.service_id, 
          p.provider_id, 
          p.status,
          s.user_id as service_owner_id,
          s.title as service_title
        FROM proposals p
        JOIN services s ON p.service_id = s.id
        WHERE p.id = ?
      `)
      .bind(proposalId)
      .first();

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se o usuário é o dono do serviço
    if (proposal.service_owner_id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para rejeitar esta proposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta já foi aceita, rejeitada ou cancelada
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta proposta não pode ser rejeitada' },
        { status: 400 }
      );
    }

    // Atualiza o status da proposta para 'rejected'
    await db
      .prepare('UPDATE proposals SET status = ? WHERE id = ?')
      .bind('rejected', proposalId)
      .run();

    // Cria uma notificação para o provedor
    await db
      .prepare(`
        INSERT INTO notifications (user_id, type, title, message, related_id, read) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proposal.provider_id,
        'proposal_rejected',
        'Proposta rejeitada',
        `Sua proposta para o serviço "${proposal.service_title}" foi rejeitada.`,
        proposalId,
        0
      )
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Proposta rejeitada com sucesso',
      proposal: {
        id: proposal.id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Erro ao rejeitar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
