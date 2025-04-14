# UTASK - Código Fonte Completo Refatorado

Este repositório contém o código-fonte completo do aplicativo UTASK, totalmente refatorado para compatibilidade com Cloudflare Pages e Edge Runtime.

## Estrutura do Projeto

```
utask_code_completo/
├── .env.example           # Exemplo de variáveis de ambiente
├── DEPLOYMENT.md          # Guia detalhado de deployment
├── DEPLOYMENT_SIMPLIFICADO.md # Guia passo a passo simplificado
├── REFACTORING.md         # Documentação das mudanças realizadas
├── next.config.js         # Configuração do Next.js otimizada para Cloudflare
├── package.json           # Dependências atualizadas e compatíveis
├── pages.config.toml      # Configuração do Cloudflare Pages
├── test_compatibility.sh  # Script para testar compatibilidade
├── wrangler.toml          # Configuração do Cloudflare Workers
└── src/                   # Código-fonte da aplicação
    ├── app/               # Rotas da aplicação (App Router)
    │   ├── api/           # Rotas de API com Edge Runtime
    │   └── ...            # Páginas da aplicação
    ├── components/        # Componentes React com "use client"
    ├── contexts/          # Contextos React
    ├── hooks/             # Hooks personalizados
    ├── lib/               # Utilitários e bibliotecas
    ├── tests/             # Testes automatizados
    └── utils/             # Funções utilitárias
```

## Principais Arquivos

### Configuração

- **package.json**: Dependências e scripts de build
- **next.config.js**: Configuração do Next.js para Cloudflare
- **wrangler.toml**: Configuração do Cloudflare Workers
- **pages.config.toml**: Configuração do Cloudflare Pages
- **.env.example**: Variáveis de ambiente necessárias

### Documentação

- **DEPLOYMENT.md**: Guia detalhado de deployment
- **DEPLOYMENT_SIMPLIFICADO.md**: Guia passo a passo simplificado
- **REFACTORING.md**: Documentação das mudanças realizadas

### Código-fonte

- **src/lib/**: Utilitários e bibliotecas (jwt.ts, password.ts, cookies.ts, api.ts)
- **src/components/**: Componentes React (Navbar.tsx, Button.tsx, Input.tsx, etc.)
- **src/contexts/**: Contextos React (AuthContext.tsx)
- **src/hooks/**: Hooks personalizados (useAuth.ts)
- **src/app/api/**: Rotas de API (auth, services, proposals, wallet, notifications)
- **src/tests/**: Testes automatizados (auth.test.js, services.test.js, proposals.test.js)

## Principais Melhorias

1. **Substituição de bibliotecas incompatíveis**:
   - bcryptjs → @noble/hashes para hash de senhas
   - jsonwebtoken → jose para manipulação de JWT
   - Remoção de dependências de módulos específicos do Node.js

2. **Configuração para Edge Runtime**:
   - Adição de `export const runtime = 'edge'` em todas as rotas de API
   - Configuração otimizada do next.config.js
   - Sintaxe correta do wrangler.toml

3. **Otimização de componentes frontend**:
   - Diretiva "use client" em todos os componentes
   - Suspense boundaries para componentes que usam hooks como useSearchParams
   - Componentes reutilizáveis otimizados

## Como Usar Este Código

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/utask.git
   cd utask
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env.local
   ```
   Edite o arquivo `.env.local` com suas configurações.

4. **Execute o aplicativo localmente**:
   ```bash
   npm run dev
   ```

5. **Para deployment**:
   Siga as instruções em `DEPLOYMENT_SIMPLIFICADO.md`

## Requisitos

- Node.js 18 ou superior
- Conta no Cloudflare
- Banco de dados D1 no Cloudflare

## Suporte

Consulte a documentação incluída neste repositório para obter ajuda com problemas comuns de deployment e configuração.

---

Desenvolvido com ❤️ para UTASK
# utaska
