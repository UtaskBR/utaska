/**
 * API para listagem e criação de serviços
 * 
 * Esta API permite listar todos os serviços e criar novos serviços.
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
    const category = url.searchParams.get('category');
    const q = url.searchParams.get('q');
    const location = url.searchParams.get('location');
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Constrói a consulta SQL base
    let query = `
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.location,
        s.status,
        c.id as category_id,
        c.name as category_name,
        u.id as user_id,
        u.name as user_name,
        u.avatar_url
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    
    // Array para armazenar os parâmetros da consulta
    const params: any[] = [];

    // Adiciona filtros à consulta
    if (category) {
      query += " AND s.category_id = ?";
      params.push(category);
    }
    
    if (q) {
      query += " AND (s.title LIKE ? OR s.description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (location) {
      query += " AND s.location LIKE ?";
      params.push(`%${location}%`);
    }
    
    if (status) {
      query += " AND s.status = ?";
      params.push(status);
    }
    
    // Adiciona ordenação e paginação
    query += " ORDER BY s.date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Prepara e executa a consulta
    let stmt = db.prepare(query);
    
    // Adiciona os parâmetros à consulta
    for (let i = 0; i < params.length; i++) {
      stmt = stmt.bind(params[i]);
    }
    
    // Executa a consulta
    const services = await stmt.all();

    // Formata os resultados
    const formattedServices = services.results.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      location: service.location,
      status: service.status,
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
      services: formattedServices,
      pagination: {
        limit,
        offset,
        total: formattedServices.length // Nota: Isso não é o total real, apenas o número de resultados retornados
      }
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtém o ID do usuário do cabeçalho (definido pelo middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
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

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Insere o novo serviço no banco de dados
    const result = await db
      .prepare(
        `INSERT INTO services 
          (title, description, price, date, location, category_id, user_id, status, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         RETURNING id, title, description, price, date, location, category_id, user_id, status, created_at`
      )
      .bind(
        title, 
        description, 
        price, 
        date, 
        location || null, 
        category_id || null, 
        parseInt(userId), 
        'pending',
        latitude || null,
        longitude || null
      )
      .first();

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao criar serviço' },
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

    // Retorna os dados do serviço criado
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
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
