"use client";

/**
 * Componente Button
 * 
 * Este componente implementa um botão reutilizável com diferentes variantes.
 * Otimizado para Edge Runtime.
 */

import React from 'react';

// Definição das propriedades do componente
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  loading = false
}: ButtonProps) {
  // Classes base do botão
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center';
  
  // Classes específicas para cada variante
  const variantClasses = {
    primary: 'bg-utask-blue text-white hover:bg-utask-blue-dark shadow-button',
    secondary: 'bg-white text-utask-blue border border-utask-blue hover:bg-utask-gray-light',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100',
    text: 'bg-transparent text-utask-blue hover:text-utask-blue-dark hover:underline'
  };
  
  // Classes específicas para cada tamanho
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Classes para botão desabilitado ou carregando
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Classes para largura total
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combinação de todas as classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <svg className="w-5 h-5 mr-2 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </>
      ) : (
        <>
          {/* Renderiza o ícone se fornecido */}
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
