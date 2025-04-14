/**
 * Teste básico para verificar as rotas de propostas
 * 
 * Este teste verifica o funcionamento básico das rotas de propostas
 * usando mocks para simular o ambiente do Cloudflare Workers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { POST as createProposal } from '../app/api/services/[id]/proposals/route';
import { POST as acceptProposal } from '../app/api/proposals/[id]/accept/route';
import { POST as rejectProposal } from '../app/api/proposals/[id]/reject/route';

// Mock para o ambiente Cloudflare Workers
const mockD1Database = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  all: jest.fn().mockResolvedValue({ results: [] }),
  first: jest.fn().mockResolvedValue(null),
  run: jest.fn().mockResolvedValue({}),
};

// Mock para NextRequest
const createMockRequest = (url, body = {}, headers = {}) => {
  const mockRequest = new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  // Adiciona o ambiente do Cloudflare
  Object.defineProperty(mockRequest, 'env', {
    value: { DB: mockD1Database },
    writable: true
  });
  
  return mockRequest;
};

describe('Rotas de Propostas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/services/[id]/proposals', () => {
    it('deve retornar erro se não estiver autenticado', async () => {
      // Cria uma requisição mock sem token de autenticação
      const req = createMockRequest('https://example.com/api/services/1/proposals', {
        price: 100,
        message: 'Proposta de teste'
      });
      
      // Chama a rota
      const response = await createProposal(req, { params: { id: '1' } });
      const data = await response.json();
      
      // Verifica se a resposta de erro está correta
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });
    
    it('deve criar uma proposta quando autenticado e dados válidos', async () => {
      // Configura mocks para simular um serviço existente
      mockD1Database.first
        .mockResolvedValueOnce({ id: 1, user_id: 2, status: 'pending', title: 'Serviço de teste' }) // Serviço
        .mockResolvedValueOnce(null) // Nenhuma proposta existente
        .mockResolvedValueOnce({ id: 1, service_id: 1, provider_id: 3, price: 100, message: 'Proposta de teste', status: 'pending', created_at: new Date().toISOString() }) // Proposta criada
        .mockResolvedValueOnce({ id: 3, name: 'Provedor', avatar_url: null }); // Provedor
      
      // Cria uma requisição mock com token de autenticação
      const req = createMockRequest(
        'https://example.com/api/services/1/proposals',
        { price: 100, message: 'Proposta de teste' },
        { 'x-user-id': '3' }
      );
      
      // Chama a rota
      const response = await createProposal(req, { params: { id: '1' } });
      const data = await response.json();
      
      // Verifica se a resposta está correta
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('proposal');
      expect(data.proposal).toHaveProperty('price', 100);
    });
  });
  
  describe('POST /api/proposals/[id]/accept', () => {
    it('deve aceitar uma proposta válida', async () => {
      // Configura mock para simular uma proposta existente
      mockD1Database.first.mockResolvedValueOnce({
        id: 1,
        service_id: 1,
        provider_id: 3,
        status: 'pending',
        service_owner_id: 2,
        service_title: 'Serviço de teste'
      });
      
      // Cria uma requisição mock com token de autenticação do dono do serviço
      const req = createMockRequest(
        'https://example.com/api/proposals/1/accept',
        {},
        { 'x-user-id': '2' }
      );
      
      // Chama a rota
      const response = await acceptProposal(req, { params: { id: '1' } });
      const data = await response.json();
      
      // Verifica se a resposta está correta
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('proposal.status', 'accepted');
      
      // Verifica se as operações no banco de dados foram chamadas
      expect(mockD1Database.prepare).toHaveBeenCalledTimes(4);
    });
  });
  
  describe('POST /api/proposals/[id]/reject', () => {
    it('deve rejeitar uma proposta válida', async () => {
      // Configura mock para simular uma proposta existente
      mockD1Database.first.mockResolvedValueOnce({
        id: 1,
        service_id: 1,
        provider_id: 3,
        status: 'pending',
        service_owner_id: 2,
        service_title: 'Serviço de teste'
      });
      
      // Cria uma requisição mock com token de autenticação do dono do serviço
      const req = createMockRequest(
        'https://example.com/api/proposals/1/reject',
        {},
        { 'x-user-id': '2' }
      );
      
      // Chama a rota
      const response = await rejectProposal(req, { params: { id: '1' } });
      const data = await response.json();
      
      // Verifica se a resposta está correta
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('proposal.status', 'rejected');
      
      // Verifica se as operações no banco de dados foram chamadas
      expect(mockD1Database.prepare).toHaveBeenCalledTimes(2);
    });
  });
});
