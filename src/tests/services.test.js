/**
 * Teste básico para verificar as rotas de serviços
 * 
 * Este teste verifica o funcionamento básico das rotas de serviços
 * usando mocks para simular o ambiente do Cloudflare Workers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET as getServices } from '../app/api/services/route';
import { GET as getNearbyServices } from '../app/api/services/nearby/route';

// Mock para o ambiente Cloudflare Workers
const mockD1Database = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  all: jest.fn().mockResolvedValue({ results: [] }),
  first: jest.fn().mockResolvedValue(null),
  run: jest.fn().mockResolvedValue({}),
};

// Mock para NextRequest
const createMockRequest = (url, headers = {}) => {
  const mockRequest = new NextRequest(url);
  
  // Adiciona o ambiente do Cloudflare
  Object.defineProperty(mockRequest, 'env', {
    value: { DB: mockD1Database },
    writable: true
  });
  
  // Adiciona headers personalizados
  headers && Object.keys(headers).forEach(key => {
    mockRequest.headers.set(key, headers[key]);
  });
  
  return mockRequest;
};

describe('Rotas de Serviços', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/services', () => {
    it('deve retornar uma lista vazia de serviços', async () => {
      // Configura o mock para retornar uma lista vazia
      mockD1Database.all.mockResolvedValueOnce({ results: [] });
      
      // Cria uma requisição mock
      const req = createMockRequest('https://example.com/api/services');
      
      // Chama a rota
      const response = await getServices(req);
      const data = await response.json();
      
      // Verifica se a resposta está correta
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('services');
      expect(data.services).toEqual([]);
    });
    
    it('deve filtrar serviços por categoria', async () => {
      // Cria uma requisição mock com parâmetro de categoria
      const req = createMockRequest('https://example.com/api/services?category=1');
      
      // Chama a rota
      await getServices(req);
      
      // Verifica se o filtro foi aplicado na consulta SQL
      expect(mockD1Database.prepare).toHaveBeenCalled();
      expect(mockD1Database.bind).toHaveBeenCalledWith(expect.anything());
    });
  });
  
  describe('GET /api/services/nearby', () => {
    it('deve retornar erro se latitude e longitude não forem fornecidas', async () => {
      // Cria uma requisição mock sem coordenadas
      const req = createMockRequest('https://example.com/api/services/nearby');
      
      // Chama a rota
      const response = await getNearbyServices(req);
      const data = await response.json();
      
      // Verifica se a resposta de erro está correta
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
    
    it('deve buscar serviços próximos quando coordenadas são fornecidas', async () => {
      // Configura o mock para retornar uma lista vazia
      mockD1Database.all.mockResolvedValueOnce({ results: [] });
      
      // Cria uma requisição mock com coordenadas
      const req = createMockRequest('https://example.com/api/services/nearby?lat=40.7128&lng=-74.0060');
      
      // Chama a rota
      const response = await getNearbyServices(req);
      const data = await response.json();
      
      // Verifica se a resposta está correta
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('services');
    });
  });
});
