/**
 * API para categorias de serviços
 * 
 * Esta API permite listar todas as categorias de serviços disponíveis.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca todas as categorias
    const categories = await db
      .prepare('SELECT id, name, icon, description FROM categories ORDER BY name')
      .all();

    // Retorna as categorias
    return NextResponse.json({
      categories: categories.results
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}
