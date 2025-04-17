/**
 * Utilitário para formatação de dados
 * 
 * Este arquivo implementa funções para formatação de dados comuns
 * como datas, valores monetários e distâncias.
 * Compatível com Vercel e Prisma.
 */

/**
 * Formata um valor monetário para o formato brasileiro
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
   * @param date Data a ser formatada
   * @returns String formatada (ex: 01/01/2023)
   */
  export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }
  
  /**
   * Formata uma data e hora para o formato brasileiro
   * @param date Data a ser formatada
   * @returns String formatada (ex: 01/01/2023 14:30)
   */
  export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }
  
  /**
   * Formata uma distância em quilômetros
   * @param distance Distância em quilômetros
   * @returns String formatada (ex: 1,5 km)
   */
  export function formatDistance(distance: number): string {
    if (distance < 1) {
      // Converter para metros se for menos de 1km
      const meters = Math.round(distance * 1000);
      return `${meters} m`;
    }
    
    return `${distance.toFixed(1).replace('.', ',')} km`;
  }
  
  /**
   * Formata um número de telefone para o formato brasileiro
   * @param phone Número de telefone (apenas dígitos)
   * @returns String formatada (ex: (11) 98765-4321)
   */
  export function formatPhone(phone: string): string {
    // Remover caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 11) {
      // Celular com DDD: (11) 98765-4321
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      // Telefone fixo com DDD: (11) 3456-7890
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 9) {
      // Celular sem DDD: 98765-4321
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length === 8) {
      // Telefone fixo sem DDD: 3456-7890
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    
    // Retornar o número original se não se encaixar nos padrões
    return phone;
  }
  
  /**
   * Formata um CEP para o formato brasileiro
   * @param cep CEP (apenas dígitos)
   * @returns String formatada (ex: 12345-678)
   */
  export function formatCEP(cep: string): string {
    // Remover caracteres não numéricos
    const digits = cep.replace(/\D/g, '');
    
    if (digits.length === 8) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    
    // Retornar o CEP original se não tiver 8 dígitos
    return cep;
  }
  
  /**
   * Formata um texto para URL amigável (slug)
   * @param text Texto a ser formatado
   * @returns String formatada (ex: "texto-para-url-amigavel")
   */
  export function formatSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  }
  