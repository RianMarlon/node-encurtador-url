# Encurtador de URL

Um serviço de encurtamento de URLs desenvolvido com TypeScript, Fastify e Prisma. Ideal para transformar links longos em URLs curtas e fáceis de compartilhar.

## Funcionalidades

- Criação de URLs encurtadas
- Redirecionamento de URLs encurtadas para URLs originais

## Tecnologias Utilizadas

- TypeScript
- Fastify
- Prisma ORM
- Jest (testes)
- ESLint & Prettier (linting e formatação)
- SWC (compilação)
- Docker & Docker Compose
- PNPM
- Husky

## Requisitos

Para executar este projeto localmente, você precisará ter instalado:

- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/RianMarlon/node-encurtador-url.git
cd node-encurtador-url
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 3. Inicie a aplicação com Docker Compose

```bash
docker compose up
```

A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada no arquivo `.env`).

Para executar em segundo plano:

```bash
docker compose up -d
```

### 4. Parar a aplicação

```bash
docker compose down
```

## Desenvolvimento

### Comandos úteis

```bash
# Instalar dependências
pnpm install

# Executar em modo de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Verificar linting
pnpm lint

# Corrigir problemas de linting
pnpm lint:fix

# Gerar cliente Prisma
pnpm prisma:generate

# Criar migration
pnpm migration:create nome-da-migration

# Executar migrations
pnpm migration:run
```

## Licenciamento

ISC

---

Desenvolvido por [Rian Marlon Sousa da Silva](https://github.com/RianMarlon)
