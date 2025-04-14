"use client";

/**
 * Utilitário para formatação de dados
 * 
 * Este arquivo implementa funções para formatação de moeda, data, distância e tempo relativo.
 * Otimizado para Edge Runtime.
 */

/**
 * Formata um valor para moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param date Data a ser formatada (string ISO ou objeto Date)
 * @param includeTime Se deve incluir o horário
 * @returns String formatada (ex: 01/01/2023 ou 01/01/2023 14:30)
 */
export function formatDate(date: string | Date, includeTime = false): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
}

/**
 * Formata uma distância em metros para km ou m
 * @param meters Distância em metros
 * @returns String formatada (ex: 1,2 km ou 500 m)
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
  }
  return `${Math.round(meters).toLocaleString('pt-BR')} m`;
}

/**
 * Formata um tempo relativo (quanto tempo atrás)
 * @param date Data a ser comparada com o momento atual
 * @returns String formatada (ex: há 5 minutos, há 2 horas, há 3 dias)
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) {
    return 'agora mesmo';
  } else if (diffMin < 60) {
    return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHour < 24) {
    return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  } else if (diffDay < 30) {
    return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
  } else if (diffMonth < 12) {
    return `há ${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`;
  } else {
    return `há ${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`;
  }
}

/**
 * Formata um número de telefone brasileiro
 * @param phone Número de telefone (apenas dígitos)
 * @returns String formatada (ex: (11) 98765-4321)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11) {
    // Celular: (11) 98765-4321
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    // Fixo: (11) 3456-7890
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  // Retorna como está se não for um formato reconhecido
  return phone;
}

/**
 * Formata um CEP brasileiro
 * @param cep CEP (apenas dígitos)
 * @returns String formatada (ex: 12345-678)
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const digits = cep.replace(/\D/g, '');
  
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  
  // Retorna como está se não for um formato reconhecido
  return cep;
}
