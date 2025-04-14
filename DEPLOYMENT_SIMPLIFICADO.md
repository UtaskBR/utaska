# Guia Passo a Passo para Deployment do UTASK no Cloudflare Pages

Este guia fornece instruções detalhadas e simplificadas para implantar o aplicativo UTASK refatorado no Cloudflare Pages.

## Pré-requisitos

- Conta no Cloudflare (gratuita)
- Repositório Git (GitHub, GitLab, etc.)
- Node.js 18+ instalado localmente

## Passo 1: Preparar o Código

1. **Clone o repositório refatorado**:
   ```bash
   git clone https://github.com/seu-usuario/utask.git
   cd utask
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Verifique a compatibilidade**:
   ```bash
   chmod +x test_compatibility.sh
   ./test_compatibility.sh
   ```
   
   Certifique-se de que todos os testes passem sem erros críticos.

## Passo 2: Configurar o Banco de Dados D1

1. **Instale o Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Faça login no Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Crie um banco de dados D1**:
   ```bash
   wrangler d1 create utask_db
   ```
   
   Anote o ID do banco de dados que será exibido.

4. **Atualize o arquivo wrangler.toml**:
   Substitua o `database_id` no arquivo `wrangler.toml` pelo ID do seu banco de dados D1:
   
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "utask_db"
   database_id = "seu-database-id-aqui"
   ```

5. **Execute as migrações iniciais**:
   ```bash
   wrangler d1 execute utask_db --file=./migrations/0001_initial.sql
   ```

## Passo 3: Configurar o Cloudflare Pages

1. **Acesse o Dashboard do Cloudflare**:
   - Vá para [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navegue até "Workers & Pages"

2. **Crie um novo projeto Pages**:
   - Clique em "Create application"
   - Selecione "Pages"
   - Clique em "Connect to Git"
   - Selecione seu repositório

3. **Configure as opções de build**:
   - **Nome do projeto**: utask (ou outro nome de sua escolha)
   - **Framework preset**: Next.js
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Node.js version**: 18.x

4. **Configure as variáveis de ambiente**:
   - Vá para a aba "Settings" > "Environment variables"
   - Adicione as seguintes variáveis:
     - `NODE_ENV`: production
     - `JWT_SECRET`: sua-chave-secreta (use uma chave forte)
     - `NEXT_PUBLIC_MAPBOX_TOKEN`: seu-token-do-mapbox (se estiver usando mapas)

5. **Vincule o banco de dados D1**:
   - Vá para a aba "Settings" > "Functions"
   - Clique em "Add binding" > "D1 Database"
   - Selecione seu banco de dados `utask_db`
   - Defina o nome da variável como `DB`

## Passo 4: Deploy

1. **Inicie o deployment**:
   - Clique em "Save and Deploy"
   - Aguarde o processo de build e deployment concluir

2. **Verifique o deployment**:
   - Após a conclusão, clique no link fornecido para acessar seu site
   - Teste o registro e login de usuários
   - Verifique se as funcionalidades principais estão funcionando

## Passo 5: Configurações Adicionais (Opcional)

1. **Configure um domínio personalizado**:
   - Vá para a aba "Custom domains"
   - Clique em "Set up a custom domain"
   - Siga as instruções para configurar seu domínio

2. **Configure regras de cache**:
   - Vá para a aba "Settings" > "Caching"
   - Ajuste as configurações de cache conforme necessário

3. **Configure análise de tráfego**:
   - Vá para a aba "Analytics"
   - Visualize estatísticas de tráfego e desempenho

## Solução de Problemas Comuns

### Erro: "Build failed"

- Verifique os logs de build para identificar o problema específico
- Certifique-se de que todas as dependências estão instaladas
- Verifique se o comando de build está correto

### Erro: "Database connection failed"

- Verifique se o ID do banco de dados está correto no `wrangler.toml`
- Certifique-se de que o binding do banco de dados está configurado nas configurações do projeto
- Verifique se as migrações foram executadas corretamente

### Erro: "Edge Runtime compatibility issues"

- Execute o script `test_compatibility.sh` para identificar problemas específicos
- Certifique-se de que todas as rotas de API têm `export const runtime = 'edge'`
- Verifique se não está usando módulos específicos do Node.js

## Recursos Adicionais

- [Documentação do Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentação do Next.js no Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Documentação do Cloudflare D1](https://developers.cloudflare.com/d1/)

## Suporte

Se encontrar problemas durante o deployment, consulte:

1. A documentação detalhada em `DEPLOYMENT.md`
2. O documento de refatoração em `REFACTORING.md` para entender as mudanças feitas
3. Os testes em `src/tests/` para verificar o comportamento esperado das funcionalidades
