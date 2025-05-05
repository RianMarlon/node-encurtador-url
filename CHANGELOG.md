# Changelog

Todas as alterações importantes neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.2.0] - 04/05/2025

### Alterações
- Adicionado listagem de URLs encurtadas por usuário autenticado
  - Endpoint para listar todas as URLs criadas por um usuário
- Middleware de autenticação
  - Verificação de autenticação em rotas

[1.2.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.2.0

## [1.1.0] - 04/05/2025

### Alterações
- Adicionado cadastro de usuário e login
  - Endpoint para registrar um novo usuário
  - Endpoint para realizar login e gerar um token JWT
- Implementada autenticação com JWT
- Implementado hash para senhas de usuários

[1.1.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.1.0

## [1.0.0] - 03/05/2025

### Alterações
- Lançamento inicial
- Funcionalidade de encurtamento de URL
  - Endpoint para criar URLs encurtadas
  - Endpoint para redirecionar de URLs encurtadas para URLs originais
- Configuração da estrutura do projeto:
  - TypeScript
  - Fastify
  - Prisma ORM
  - Jest
  - Eslint
  - Prettier
  - SWC
  - Docker
  - Docker Compose
  - Husky
  - PNPM
- Cobertura de testes para funcionalidades principais
- Workflows de CI para linting e testes automatizados

[1.0.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.0.0
