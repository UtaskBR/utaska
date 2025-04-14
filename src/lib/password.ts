"use client";

/**
 * Utilitário para funções de hash de senha
 * 
 * Este arquivo implementa funções para hash e verificação de senhas
 * utilizando a biblioteca @noble/hashes que é compatível com Edge Runtime.
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

// Configurações para o PBKDF2
const ITERATIONS = 10000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/**
 * Gera um salt aleatório para uso no hash de senha
 * @returns Salt em formato hexadecimal
 */
function generateSalt(): string {
  const saltBytes = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(saltBytes);
  return bytesToHex(saltBytes);
}

/**
 * Cria um hash da senha usando PBKDF2 com SHA-256
 * @param password Senha em texto plano
 * @returns String no formato "$pbkdf2-sha256$iterations$salt$hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const passwordBytes = utf8ToBytes(password);
  const hash = pbkdf2(sha256, passwordBytes, hexToBytes(salt), {
    c: ITERATIONS,
    dkLen: KEY_LENGTH,
  });
  
  return `$pbkdf2-sha256$${ITERATIONS}$${salt}$${bytesToHex(hash)}`;
}

/**
 * Verifica se uma senha corresponde a um hash
 * @param password Senha em texto plano
 * @param hashedPassword Hash da senha no formato "$pbkdf2-sha256$iterations$salt$hash"
 * @returns true se a senha corresponder ao hash, false caso contrário
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Formato esperado: $pbkdf2-sha256$iterations$salt$hash
    const parts = hashedPassword.split('$');
    
    // Verificar se o formato está correto
    if (parts.length !== 5 || parts[1] !== 'pbkdf2-sha256') {
      // Verificar se é um hash bcrypt legado (não suportado no Edge)
      if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
        console.error('Hash bcrypt detectado, não suportado no Edge Runtime');
        return false;
      }
      
      console.error('Formato de hash inválido');
      return false;
    }
    
    const iterations = parseInt(parts[2], 10);
    const salt = parts[3];
    const storedHash = parts[4];
    
    // Calcular o hash com a senha fornecida
    const passwordBytes = utf8ToBytes(password);
    const calculatedHash = pbkdf2(sha256, passwordBytes, hexToBytes(salt), {
      c: iterations,
      dkLen: KEY_LENGTH,
    });
    
    // Comparar os hashes
    return bytesToHex(calculatedHash) === storedHash;
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
}

/**
 * Verifica se um hash de senha está no formato antigo (bcrypt)
 * e precisa ser atualizado para o novo formato PBKDF2
 * @param hashedPassword Hash da senha armazenado
 * @returns true se o hash precisa ser atualizado, false caso contrário
 */
export function needsRehash(hashedPassword: string): boolean {
  return !hashedPassword.startsWith('$pbkdf2-sha256$');
}
