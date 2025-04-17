"use client";

/**
 * Componente SearchPage com Suspense
 * 
 * Este componente implementa a página de busca com Suspense boundary
 * para resolver o problema com useSearchParams.
 * Adaptado para Vercel.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter, FiMapPin } from 'react-icons/fi';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ServiceOrderCard from '@/components/ServiceOrderCard';
import { useRouter } from 'next/navigation';
import { get } from '@/lib/api';

// Componente de carregamento
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-utask-blue animate-spin mb-4"></div>
      <p className="text-gray-500">Carregando resultados...</p>
    </div>
  );
}

// Componente de conteúdo da busca que usa useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  interface Service {
    id: number;
    title: string;
    description: string;
    price: number;
    date: string;
    location?: string;
    distance?: number;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    user?: {
      id: number;
      name: string;
    };
    category?: {
      id: number;
      name: string;
    };
  }

  const [services, setServices] = useState<Service[]>([]);
  interface Category {
    id: string;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Efeito para carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get('/api/categories');
        if (response.error) {
          throw new Error(response.error);
        }
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };

    fetchCategories();
  }, []);

  // Efeito para buscar serviços com base nos parâmetros
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');

        // Constrói a URL de busca com os parâmetros
        let searchUrl = '/api/services?';
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        if (location) params.append('location', location);
        
        searchUrl += params.toString();

        const response = await get(searchUrl);
        
        if (response.error) {
          throw new Error(response.error);
        }

        setServices(response.data.services || []);
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        setError('Não foi possível carregar os serviços. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    // Se tiver parâmetros de busca, faz a busca
    if (searchParams.get('q') || searchParams.get('category') || searchParams.get('location')) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Função para lidar com a submissão do formulário de busca
  interface SearchParams {
    q?: string;
    category?: string;
    location?: string;
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Constrói a URL com os parâmetros de busca
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    
    // Navega para a URL de busca
    router.push(`/search?${params.toString()}`);
  };

  // Função para visualizar detalhes de um serviço
  const handleViewDetails = (id: number): void => {
    router.push(`/services/${id}`);
  };

  // Função para fazer uma proposta para um serviço
  const handleMakeProposal = (id: string): void => {
    router.push(`/services/${id}/propose`);
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Buscar Serviços</h1>

      {/* Formulário de busca */}
      <Card className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <Input
              id="search-query"
              label="O que você está procurando?"
              placeholder="Ex: Encanador, Eletricista, Design de Logo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<FiSearch />}
            />
          </div>

          {/* Botão para mostrar/esconder filtros */}
          <div className="mb-4">
            <button
              type="button"
              className="flex items-center text-utask-blue"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="mr-2" />
              {showFilters ? 'Esconder filtros' : 'Mostrar filtros'}
            </button>
          </div>

          {/* Filtros adicionais */}
          {showFilters && (
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-utask-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-utask-blue"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  id="location"
                  label="Localização"
                  placeholder="Cidade, Estado ou CEP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  icon={<FiMapPin />}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button type="submit" fullWidth>
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      {/* Resultados da busca */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-100 rounded-md">
          <FiSearch className="mx-auto mb-2 text-gray-300" size={48} />
          <p>Nenhum serviço encontrado com os critérios de busca.</p>
          <p className="mt-2">Tente ajustar seus filtros ou buscar por termos diferentes.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceOrderCard
              key={service.id}
              service={service}
              onViewDetails={handleViewDetails}
              onMakeProposal={(id) => handleMakeProposal(id.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal com Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  );
}
