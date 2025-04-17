import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { generateJWT } from '@/lib/jwt'

// Valida o formato do email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Valida força da senha
function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, city, state } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números' }, { status: 400 })
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 })
    }

    // Cria novo usuário
    const hashedPassword = await hashPassword(password)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Campos extras se você adicionar no modelo
        // city,
        // state,
      },
    })

    // Gera o token JWT
    const token = await generateJWT({ userId: newUser.id, email: newUser.email })

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      token,
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
