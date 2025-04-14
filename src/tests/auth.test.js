/**
 * Teste básico para verificar a autenticação
 * 
 * Este teste verifica o funcionamento básico do sistema de autenticação
 * usando as funções de hash de senha e JWT compatíveis com Edge Runtime.
 */

import { hashPassword, verifyPassword } from '../lib/password';
import { generateJWT, verifyJWT } from '../lib/jwt';

describe('Autenticação', () => {
  describe('Hash de senha', () => {
    it('deve gerar um hash de senha válido', async () => {
      const password = 'senha123';
      const hash = await hashPassword(password);
      
      // Verifica se o hash foi gerado e tem o formato correto
      expect(hash).toBeDefined();
      expect(hash.startsWith('$pbkdf2-sha256$')).toBe(true);
      
      // Verifica se o hash pode ser verificado
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
    
    it('deve rejeitar senhas incorretas', async () => {
      const password = 'senha123';
      const wrongPassword = 'senha456';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
  
  describe('JWT', () => {
    it('deve gerar e verificar um token JWT', async () => {
      const payload = { userId: 123, email: 'teste@exemplo.com' };
      const token = await generateJWT(payload);
      
      // Verifica se o token foi gerado
      expect(token).toBeDefined();
      
      // Verifica se o token pode ser decodificado
      const decoded = await verifyJWT(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });
    
    it('deve rejeitar tokens inválidos', async () => {
      const invalidToken = 'invalid.token.here';
      const decoded = await verifyJWT(invalidToken);
      expect(decoded).toBeNull();
    });
  });
});
