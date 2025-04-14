"use client";

/**
 * Componente Card
 * 
 * Este componente implementa um card reutilizável para exibição de informações.
 * Otimizado para Edge Runtime.
 */

import React from 'react';

// Definição das propriedades do componente
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
  elevated = true
}: CardProps) {
  // Classes base do card
  const baseClasses = 'bg-white rounded-xl overflow-hidden';
  
  // Classes para borda
  const borderClasses = bordered ? 'border border-utask-gray' : '';
  
  // Classes para elevação (sombra)
  const shadowClasses = elevated ? 'shadow-card' : '';
  
  // Classes para hover
  const hoverClasses = hoverable ? 'transition-transform duration-200 hover:scale-[1.02] cursor-pointer' : '';
  
  // Combinação de todas as classes
  const cardClasses = `
    ${baseClasses}
    ${borderClasses}
    ${shadowClasses}
    ${hoverClasses}
    ${className}
  `;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Cabeçalho do card (se título ou subtítulo forem fornecidos) */}
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-utask-gray">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      {/* Conteúdo do card */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Rodapé do card (se fornecido) */}
      {footer && (
        <div className="px-4 py-3 border-t border-utask-gray bg-utask-gray-light">
          {footer}
        </div>
      )}
    </div>
  );
}
