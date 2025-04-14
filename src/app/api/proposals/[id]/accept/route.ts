/**
 * API para aceitar uma proposta
 * 
 * Esta API permite que o dono de um serviço aceite uma proposta.
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
          p.price, 
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
        { error: 'Você não tem permissão para aceitar esta proposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta já foi aceita, rejeitada ou cancelada
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta proposta não pode ser aceita' },
        { status: 400 }
      );
    }

    // Inicia uma transação
    // Nota: D1 não suporta transações completas, então vamos fazer as operações em sequência
    // e tratar erros manualmente

    // 1. Atualiza o status da proposta para 'accepted'
    await db
      .prepare('UPDATE proposals SET status = ? WHERE id = ?')
      .bind('accepted', proposalId)
      .run();

    // 2. Atualiza o status do serviço para 'in_progress'
    await db
      .prepare('UPDATE services SET status = ? WHERE id = ?')
      .bind('in_progress', proposal.service_id)
      .run();

    // 3. Rejeita todas as outras propostas para este serviço
    await db
      .prepare('UPDATE proposals SET status = ? WHERE service_id = ? AND id != ?')
      .bind('rejected', proposal.service_id, proposalId)
      .run();

    // 4. Cria uma notificação para o provedor
    await db
      .prepare(`
        INSERT INTO notifications (user_id, type, title, message, related_id, read) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proposal.provider_id,
        'proposal_accepted',
        'Proposta aceita',
        `Sua proposta para o serviço "${proposal.service_title}" foi aceita!`,
        proposalId,
        0
      )
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Proposta aceita com sucesso',
      proposal: {
        id: proposal.id,
        status: 'accepted'
      }
    });
  } catch (error) {
    console.error('Erro ao aceitar proposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
