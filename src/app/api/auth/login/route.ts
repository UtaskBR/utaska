/**
 * API de Login de Usuários
 * 
 * Esta API permite que usuários façam login no sistema UTASK.
 * Ela valida as credenciais, verifica a senha e retorna um token JWT.
 * Implementação completa com Prisma para Vercel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/lib/password';
import { generateJWT } from '@/lib/jwt';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

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

    // Busca o usuário pelo email usando Prisma
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verifica a senha
    const isPasswordValid = await verifyPassword(password, user.password);

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

    // Cria a resposta com os dados do usuário e o token
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city || '',
        state: user.state || '',
        avatar_url: user.avatar_url || '',
        balance: user.balance || 0,
        createdAt: user.createdAt
      },
      token
    });

    // Define o cookie com o token JWT
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    // Desconecta o cliente Prisma para evitar conexões pendentes
    await prisma.$disconnect();
  }
}

// Adicione suporte a CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
