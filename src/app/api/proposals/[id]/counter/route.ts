/**
 * API para fazer uma contraproposta
 * 
 * Esta API permite que o dono de um serviço faça uma contraproposta.
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
        { error: 'Você não tem permissão para fazer uma contraproposta' },
        { status: 403 }
      );
    }

    // Verifica se a proposta está pendente
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Não é possível fazer uma contraproposta para esta proposta' },
        { status: 400 }
      );
    }

    // Atualiza a proposta com o novo preço e mensagem, e muda o status para 'counter'
    await db
      .prepare('UPDATE proposals SET price = ?, message = ?, status = ? WHERE id = ?')
      .bind(price, message || '', 'counter', proposalId)
      .run();

    // Cria uma notificação para o provedor
    await db
      .prepare(`
        INSERT INTO notifications (user_id, type, title, message, related_id, read) 
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        proposal.provider_id,
        'counter_proposal',
        'Contraproposta recebida',
        `Você recebeu uma contraproposta para o serviço "${proposal.service_title}"`,
        proposalId,
        0
      )
      .run();

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Contraproposta enviada com sucesso',
      proposal: {
        id: proposal.id,
        price,
        message: message || '',
        status: 'counter'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar contraproposta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
