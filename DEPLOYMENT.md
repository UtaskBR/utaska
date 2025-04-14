# Guia de Deployment do UTASK no Cloudflare Pages

Este documento fornece instruções detalhadas para implantar o aplicativo UTASK no Cloudflare Pages, garantindo compatibilidade com o Edge Runtime.

## Pré-requisitos

- Conta no Cloudflare
- Cloudflare Pages habilitado
- Banco de dados D1 criado no Cloudflare
- Node.js 18+ instalado localmente
- Git instalado localmente

## Configuração Inicial

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/utask.git
cd utask
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env.local` e preencha os valores necessários:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações.

## Configuração do Banco de Dados D1

1. **Crie um banco de dados D1 no Cloudflare**

Acesse o dashboard do Cloudflare, vá para Workers & Pages > D1 e crie um novo banco de dados chamado `utask_db`.

2. **Anote o ID do banco de dados**

Após criar o banco de dados, anote o ID que será usado na configuração do `wrangler.toml`.

3. **Atualize o arquivo `wrangler.toml`**

Substitua o `database_id` no arquivo `wrangler.toml` pelo ID do seu banco de dados D1:

```toml
[[d1_databases]]
binding = "DB"
database_name = "utask_db"
database_id = "seu-database-id-aqui"
```

4. **Execute as migrações iniciais**

```bash
npx wrangler d1 execute utask_db --file=./migrations/0001_initial.sql
```

## Configuração do Cloudflare Pages

1. **Conecte seu repositório ao Cloudflare Pages**

- Acesse o dashboard do Cloudflare
- Vá para Workers & Pages > Pages
- Clique em "Create a project" > "Connect to Git"
- Selecione seu repositório

2. **Configure as opções de build**

- **Nome do projeto**: utask (ou outro nome de sua escolha)
- **Framework preset**: Next.js
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Node.js version**: 18.x

3. **Configure as variáveis de ambiente**

Adicione as seguintes variáveis de ambiente:

- `NODE_ENV`: production
- `JWT_SECRET`: sua-chave-secreta (use uma chave forte)
- `NEXT_PUBLIC_MAPBOX_TOKEN`: seu-token-do-mapbox (se estiver usando mapas)

4. **Vincule o banco de dados D1**

- Na seção "Functions" das configurações do projeto
- Clique em "Add binding" > "D1 Database"
- Selecione seu banco de dados `utask_db`
- Defina o nome da variável como `DB`

## Deployment

### Método 1: Deployment Automático (recomendado)

Após configurar o Cloudflare Pages, cada push para a branch principal do seu repositório iniciará automaticamente um novo deployment.

### Método 2: Deployment Manual

1. **Build local**

```bash
npm run pages:build
```

2. **Deploy para o Cloudflare Pages**

```bash
npm run pages:deploy
```

## Verificação do Deployment

1. Após o deployment, acesse a URL fornecida pelo Cloudflare Pages
2. Verifique se todas as funcionalidades estão operando corretamente
3. Teste o registro e login de usuários
4. Verifique se as rotas de API estão funcionando

## Solução de Problemas

### Erro de Compatibilidade com Edge Runtime

Se encontrar erros relacionados ao Edge Runtime:

1. Verifique se todas as rotas de API têm `export const runtime = 'edge'`
2. Certifique-se de que não está usando módulos específicos do Node.js
3. Verifique se o `wrangler.toml` está configurado corretamente

### Erro de Banco de Dados

Se encontrar erros relacionados ao banco de dados D1:

1. Verifique se o ID do banco de dados está correto no `wrangler.toml`
2. Certifique-se de que as migrações foram executadas corretamente
3. Verifique se o binding do banco de dados está configurado nas configurações do projeto

### Outros Erros

Para outros erros, consulte os logs de build e deployment no dashboard do Cloudflare Pages.

## Manutenção e Atualizações

Para atualizar o aplicativo:

1. Faça as alterações necessárias no código
2. Teste localmente usando `npm run dev`
3. Faça commit e push das alterações
4. O Cloudflare Pages iniciará automaticamente um novo deployment

## Recursos Adicionais

- [Documentação do Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentação do Next.js no Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Documentação do Cloudflare D1](https://developers.cloudflare.com/d1/)
