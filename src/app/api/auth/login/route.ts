/**
 * API de Login de Usuários
 * 
 * Esta API permite que usuários façam login no sistema UTASK.
 * Ela valida as credenciais, verifica a senha e retorna um token JWT.
 * Otimizada para Edge Runtime.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { verifyPassword } from '@/lib/password';
import { generateJWT } from '@/lib/jwt';

// Configuração para Edge Runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Obtém o corpo da requisição
    const body = await request.json();
    const { email, password } = body;

    // Validação dos campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Acesso ao banco de dados D1
    const db = (request as any).env.DB as D1Database;

    // Busca o usuário pelo email
    const user = await db
      .prepare('SELECT id, name, email, password_hash, city, state, avatar_url, balance, created_at FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verifica a senha usando a função compatível com Edge
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gera o token JWT
    const token = await generateJWT(
      { userId: user.id, email: user.email }
    );

    // Retorna os dados do usuário e o token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        state: user.state,
        avatar_url: user.avatar_url,
        balance: user.balance,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
