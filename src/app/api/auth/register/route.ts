/**
 * API de Registro de Usuários
 * 
 * Esta API permite que novos usuários se registrem no sistema UTASK.
 * Ela valida os dados de entrada, cria um novo usuário no banco de dados,
 * e retorna um token JWT para autenticação.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { hashPassword } from '@/lib/password';
import { generateJWT } from '@/lib/jwt';

// Configuração para Edge Runtime
export const runtime = 'edge';

// Função para validar o formato do email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar a força da senha
function isStrongPassword(password: string): boolean {
  // Senha deve ter pelo menos 8 caracteres, incluindo letras e números
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export async function POST(request: NextRequest) {
  try {
    // Obtém o corpo da requisição
    const body = await request.json();
    const { name, email, password, city, state } = body;

    // Validação dos campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação do formato do email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validação da força da senha
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números' },
        { status: 400 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Verifica se o email já está em uso
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }
      );
    }

    // Gera o hash da senha usando a biblioteca compatível com Edge
    const passwordHash = await hashPassword(password);

    // Insere o novo usuário no banco de dados
    const result = await db
      .prepare(
        'INSERT INTO users (name, email, password_hash, city, state) VALUES (?, ?, ?, ?, ?) RETURNING id, name, email, city, state, created_at'
      )
      .bind(name, email, passwordHash, city || null, state || null)
      .first();

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Cria o token JWT usando a biblioteca jose
    const token = await generateJWT(
      { userId: result.id, email: result.email }
    );

    // Retorna os dados do usuário e o token
    return NextResponse.json({
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        city: result.city,
        state: result.state,
        createdAt: result.created_at
      },
      token
    }, { status: 201 });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
