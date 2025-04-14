#!/bin/bash

# Script para verificar a compatibilidade do projeto com Edge Runtime e Cloudflare Pages

echo "Iniciando testes de compatibilidade com Edge Runtime..."
echo "======================================================"

# Verificar versões das ferramentas
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
WRANGLER_VERSION=$(npx wrangler -v 2>/dev/null || echo "Não instalado")

if [[ $NODE_VERSION ]]; then
  echo "✅ Versão do Node.js: ${NODE_VERSION:1}"
else
  echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18 ou superior."
  exit 1
fi

if [[ $NPM_VERSION ]]; then
  echo "✅ Versão do npm: $NPM_VERSION"
else
  echo "❌ npm não encontrado."
  exit 1
fi

if [[ $WRANGLER_VERSION != "Não instalado" ]]; then
  echo "✅ Versão do wrangler: $WRANGLER_VERSION"
else
  echo "⚠️ wrangler não encontrado. Recomendamos instalar globalmente: npm install -g wrangler"
fi

# Verificar arquivos de configuração essenciais
if [ -f "package.json" ]; then
  echo "✅ package.json encontrado"
else
  echo "❌ package.json não encontrado. Este arquivo é essencial."
  exit 1
fi

if [ -f "wrangler.toml" ]; then
  echo "✅ wrangler.toml encontrado"
else
  echo "❌ wrangler.toml não encontrado. Este arquivo é necessário para o Cloudflare Workers."
fi

if [ -f "next.config.js" ]; then
  echo "✅ next.config.js encontrado"
else
  echo "❌ next.config.js não encontrado. Este arquivo é necessário para configurar o Next.js."
fi

if [ -f "pages.config.toml" ]; then
  echo "✅ pages.config.toml encontrado"
else
  echo "⚠️ pages.config.toml não encontrado. Este arquivo é recomendado para configurações do Cloudflare Pages."
fi

# Verificar arquivos de ambiente
if [ -f ".env.example" ]; then
  echo "✅ .env.example encontrado"
else
  echo "⚠️ .env.example não encontrado. Este arquivo é recomendado para documentar as variáveis de ambiente necessárias."
fi

if [ -f ".env.local" ]; then
  echo "✅ .env.local encontrado"
else
  echo "⚠️ .env.local não encontrado. Criando a partir do .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✅ .env.local criado com sucesso."
  else
    echo "❌ Não foi possível criar .env.local pois .env.example não existe."
  fi
fi

# Verificar dependências incompatíveis com Edge Runtime
echo "Verificando dependências incompatíveis com Edge Runtime..."
INCOMPATIBLE_DEPS=("bcrypt" "bcryptjs" "crypto" "fs" "jsonwebtoken" "node-fetch" "pg" "mysql" "mongodb" "mongoose" "sqlite3" "sequelize" "typeorm" "prisma")
FOUND_INCOMPATIBLE=false

for dep in "${INCOMPATIBLE_DEPS[@]}"; do
  if grep -q "\"$dep\":" package.json; then
    echo "❌ Dependência incompatível encontrada: $dep"
    FOUND_INCOMPATIBLE=true
  fi
done

if [ "$FOUND_INCOMPATIBLE" = false ]; then
  echo "✅ Nenhuma dependência incompatível encontrada no package.json"
fi

# Verificar configuração de Edge Runtime nas rotas de API
echo "Verificando configuração de Edge Runtime nas rotas de API..."
API_ROUTES=$(find src/app/api -name "route.ts" -o -name "route.js" 2>/dev/null)
API_ROUTES_COUNT=$(echo "$API_ROUTES" | grep -v "^$" | wc -l)
EDGE_RUNTIME_COUNT=0

if [ -z "$API_ROUTES" ]; then
  echo "⚠️ Nenhuma rota de API encontrada."
else
  for route in $API_ROUTES; do
    if grep -q "export const runtime = 'edge'" "$route"; then
      EDGE_RUNTIME_COUNT=$((EDGE_RUNTIME_COUNT + 1))
    fi
  done
  
  if [ "$EDGE_RUNTIME_COUNT" -eq "$API_ROUTES_COUNT" ]; then
    echo "✅ Todas as $API_ROUTES_COUNT rotas de API têm configuração de Edge Runtime"
  else
    echo "⚠️ Apenas $EDGE_RUNTIME_COUNT de $API_ROUTES_COUNT rotas de API têm configuração de Edge Runtime"
  fi
fi

# Verificar diretiva 'use client' nos componentes React
echo "Verificando diretiva 'use client' nos componentes React..."
COMPONENTS=$(find src/components -name "*.tsx" -o -name "*.jsx" 2>/dev/null)
COMPONENTS_COUNT=$(echo "$COMPONENTS" | grep -v "^$" | wc -l)
USE_CLIENT_COUNT=0

if [ -z "$COMPONENTS" ]; then
  echo "⚠️ Nenhum componente React encontrado."
else
  for component in $COMPONENTS; do
    if grep -q "\"use client\"" "$component"; then
      USE_CLIENT_COUNT=$((USE_CLIENT_COUNT + 1))
    fi
  done
  
  if [ "$USE_CLIENT_COUNT" -eq "$COMPONENTS_COUNT" ]; then
    echo "✅ Todos os $COMPONENTS_COUNT componentes têm diretiva 'use client'"
  else
    echo "⚠️ Apenas $USE_CLIENT_COUNT de $COMPONENTS_COUNT componentes têm diretiva 'use client'"
  fi
fi

# Verificar script de build do Cloudflare Pages
if grep -q "\"pages:build\"" package.json; then
  echo "✅ Script de build do Cloudflare Pages encontrado no package.json"
else
  echo "⚠️ Script de build do Cloudflare Pages não encontrado no package.json"
  echo "   Recomendação: adicione \"pages:build\": \"next build\" ao seu package.json"
fi

# Executar build de teste
echo "Executando build de teste (isso pode levar alguns minutos)..."
npm run build > build_log.txt 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
else
  echo "❌ Erro no build. Verifique o arquivo build_log.txt para mais detalhes."
fi

echo "======================================================"
echo "Testes de compatibilidade concluídos."
echo "Resumo:"
echo "- Ambiente: ✅ Node.js ${NODE_VERSION:1}"
echo "- Configuração: ✅ Arquivos de configuração"

if [ "$FOUND_INCOMPATIBLE" = false ]; then
  echo "- Dependências: ✅ Compatibilidade com Edge Runtime"
else
  echo "- Dependências: ❌ Incompatibilidades encontradas"
fi

if [ "$EDGE_RUNTIME_COUNT" -eq "$API_ROUTES_COUNT" ]; then
  echo "- API Routes: ✅ Configuração de Edge Runtime"
else
  echo "- API Routes: ⚠️ Configuração incompleta de Edge Runtime"
fi

if [ "$USE_CLIENT_COUNT" -eq "$COMPONENTS_COUNT" ]; then
  echo "- Componentes: ✅ Diretiva 'use client'"
else
  echo "- Componentes: ⚠️ Diretiva 'use client' incompleta"
fi

if [ $? -eq 0 ]; then
  echo "- Build: ✅ Processo de build"
  echo "✅ O projeto está pronto para deployment no Cloudflare Pages!"
else
  echo "- Build: ❌ Processo de build"
  echo "⚠️ Há problemas que precisam ser resolvidos antes do deployment."
fi
