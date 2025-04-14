"use client";

/**
 * Utilitário para manipulação de JWT
 * 
 * Este arquivo implementa funções para geração e verificação de tokens JWT
 * utilizados na autenticação da aplicação.
 * Utiliza a biblioteca jose que é compatível com Edge Runtime.
 */

import * as jose from 'jose';

// Chave secreta para assinatura do JWT (em produção, deve ser uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'utask-secret-key';
// Usando TextEncoder global disponível no Edge Runtime em vez de importar de 'util'
const SECRET = new TextEncoder().encode(JWT_SECRET);

// Interface para o token decodificado
export interface DecodedToken {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera um token JWT para o usuário
 * @param payload Dados a serem incluídos no token
 * @param expiresIn Tempo de expiração do token (padrão: 7 dias)
 * @returns Token JWT gerado
 */
export async function generateJWT(
  payload: { userId: number; email: string },
  expiresIn: string = '7d'
): Promise<string> {
  // Converter expiresIn para segundos
  let seconds = 7 * 24 * 60 * 60; // 7 dias padrão
  
  if (expiresIn.endsWith('d')) {
    seconds = parseInt(expiresIn.slice(0, -1)) * 24 * 60 * 60;
  } else if (expiresIn.endsWith('h')) {
    seconds = parseInt(expiresIn.slice(0, -1)) * 60 * 60;
  } else if (expiresIn.endsWith('m')) {
    seconds = parseInt(expiresIn.slice(0, -1)) * 60;
  } else if (expiresIn.endsWith('s')) {
    seconds = parseInt(expiresIn.slice(0, -1));
  }

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + seconds)
    .sign(SECRET);
  
  return jwt;
}

/**
 * Verifica e decodifica um token JWT
 * @param token Token JWT a ser verificado
 * @returns Objeto com os dados do token decodificado ou null se inválido
 */
export async function verifyJWT(token: string): Promise<DecodedToken | null> {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET);
    return payload as unknown as DecodedToken;
  } catch (error) {
    console.error('Erro ao verificar JWT:', error);
    return null;
  }
}
