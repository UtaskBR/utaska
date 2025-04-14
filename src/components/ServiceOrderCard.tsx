"use client";

/**
 * Componente ServiceOrderCard
 * 
 * Este componente implementa um card para exibição de ordens de serviço.
 * Otimizado para Edge Runtime.
 */

import React from 'react';
import Link from 'next/link';
import { FiClock, FiMapPin, FiDollarSign, FiUser } from 'react-icons/fi';
import { formatCurrency, formatDate, formatDistance } from '@/utils/formatters';
import Card from './Card';
import Button from './Button';

// Definição das propriedades do componente
interface ServiceOrderCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: number;
    date: string;
    location?: string;
    distance?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    user?: {
      id: number;
      name: string;
      avatar_url?: string;
      rating?: number;
    };
    category?: {
      id: number;
      name: string;
      icon?: string;
    };
  };
  showActions?: boolean;
  onViewDetails?: (id: number) => void;
  onMakeProposal?: (id: number) => void;
}

export default function ServiceOrderCard({
  service,
  showActions = true,
  onViewDetails,
  onMakeProposal
}: ServiceOrderCardProps) {
  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Função para lidar com o clique no botão de detalhes
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(service.id);
    }
  };

  // Função para lidar com o clique no botão de proposta
  const handleMakeProposal = () => {
    if (onMakeProposal) {
      onMakeProposal(service.id);
    }
  };

  return (
    <Card
      className="relative h-full flex flex-col"
      hoverable
    >
      {/* Badge de status */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
          {getStatusText(service.status)}
        </span>
      </div>

      {/* Título e categoria */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{service.title}</h3>
        {service.category && (
          <span className="text-sm text-gray-500">{service.category.name}</span>
        )}
      </div>

      {/* Descrição truncada */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {service.description}
      </p>

      {/* Detalhes do serviço */}
      <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
        <div className="flex items-start">
          <FiClock className="mt-1 mr-2 shrink-0" />
          <span>{formatDate(service.date, true)}</span>
        </div>

        {service.location && (
          <div className="flex items-start">
            <FiMapPin className="mt-1 mr-2 shrink-0" />
            <span>{service.location}</span>
          </div>
        )}

        {service.distance !== undefined && (
          <div className="flex items-start">
            <span className="mr-2">📍</span>
            <span>{formatDistance(service.distance)}</span>
          </div>
        )}

        {service.user && (
          <div className="flex items-start">
            <FiUser className="mt-1 mr-2 shrink-0" />
            <span>{service.user.name}</span>
          </div>
        )}

        <div className="flex items-start">
          <FiDollarSign className="mt-1 mr-2 shrink-0" />
          <span>{formatCurrency(service.price)}</span>
        </div>
      </div>

      {/* Botões de ação */}
      {showActions && (
        <div className="mt-auto pt-2 flex flex-col space-y-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleViewDetails}
          >
            Ver Detalhes
          </Button>
          
          {service.status === 'pending' && onMakeProposal && (
            <Button
              variant="outline"
              fullWidth
              onClick={handleMakeProposal}
            >
              Fazer Proposta
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
