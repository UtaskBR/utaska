"use client";

/**
 * Componente Input
 * 
 * Este componente implementa um campo de entrada reutilizável com validação e feedback.
 * Otimizado para Edge Runtime.
 */

import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

// Definição das propriedades do componente
interface InputProps {
  id: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  maxLength,
  min,
  max,
  step,
  rows = 3
}: InputProps) {
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  
  // Determina o tipo real do input (para alternar visibilidade da senha)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Classes base do input
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  
  // Classes para estado de erro
  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500 pr-10' 
    : 'border-utask-gray focus:ring-utask-blue';
  
  // Classes para input desabilitado
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  // Classes para input com ícone
  const iconClasses = icon ? 'pl-10' : '';
  
  // Combinação de todas as classes
  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${disabledClasses}
    ${iconClasses}
    ${className}
  `;
  
  // Renderiza um textarea se o tipo for 'textarea'
  if (type === 'textarea') {
    return (
      <div className="mb-4">
        {/* Label do campo */}
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Container do textarea */}
        <div className="relative">
          {/* Ícone (se fornecido) */}
          {icon && (
            <div className="absolute left-3 top-3 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Textarea */}
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            rows={rows}
            className={inputClasses}
          />
          
          {/* Ícone de erro (se houver) */}
          {error && (
            <div className="absolute right-3 top-3 text-red-500">
              <FiAlertCircle size={18} />
            </div>
          )}
        </div>
        
        {/* Mensagem de erro (se houver) */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
  
  // Renderiza um input padrão para outros tipos
  return (
    <div className="mb-4">
      {/* Label do campo */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Container do input */}
      <div className="relative">
        {/* Ícone (se fornecido) */}
        {icon && (
          <div className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
        />
        
        {/* Botão para alternar visibilidade da senha */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
        
        {/* Ícone de erro (se houver e não for campo de senha) */}
        {error && type !== 'password' && (
          <div className="absolute right-3 top-2.5 text-red-500">
            <FiAlertCircle size={18} />
          </div>
        )}
      </div>
      
      {/* Mensagem de erro (se houver) */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
