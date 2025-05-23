# Encurtador de URL

Um serviço de encurtamento de URLs desenvolvido com TypeScript, Fastify e Prisma. Ideal para transformar links longos em URLs curtas e fáceis de compartilhar.

## Funcionalidades

- Cadastro e login de usuários com autenticação JWT
- Criação de URLs encurtadas (disponível para usuários autenticados ou não)
- Redirecionamento de URLs encurtadas para URLs originais
- Atualização da URL original (restrita ao usuário autenticado criador da URL)
- Deleção de URLs encurtadas com soft delete (restrita ao usuário autenticado criador da URL)
- Listagem de URLs criadas por um usuário autenticado

## Tecnologias Utilizadas

- TypeScript
- Fastify
- Prisma ORM
- Pino (logs)
- Jest (testes)
- ESLint & Prettier (linting e formatação)
- SWC (compilação)
- Docker & Docker Compose
- PNPM
- Husky
- Swagger (documentação da API com @fastify/swagger e @fastify/swagger-ui)

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

## Documentação da API

A documentação da API foi gerada utilizando as bibliotecas **`@fastify/swagger`** e **`@fastify/swagger-ui`**, seguindo a especificação **OpenAPI 3.0.0**. Ela fornece uma interface interativa para explorar e testar os endpoints da aplicação.

### Acessando a Documentação

Após iniciar a aplicação, você pode acessar a documentação da API na seguinte URL:
```bash
http://localhost:3000/docs
```

A documentação informa todos os endpoints da API, incluindo detalhes sobre os parâmetros, respostas, e possíveis erros.


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
