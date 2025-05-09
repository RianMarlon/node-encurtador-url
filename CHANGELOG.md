# Changelog

Todas as alterações importantes neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.6.0] - 09/05/2025

### Refatorações
- Movidas validações que antes estavam na entidade para o controller.

### Correções
- Tratamento de erro para entrada de JSON inválido, retornando resposta padronizada de `400 Bad Request`.

[1.6.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.6.0

## [1.5.1] - 07/05/2025

### Correções
- Adicionada validação dos dados de entrada no fluxo de login
- Corrigido o fluxo de criação de usuário para validar os dados antes de verificar se já existe um usuário com o e-mail

[1.5.1]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.5.1

## [1.5.0] - 06/05/2025

### Alterações
- Adicionada documentação da API com Swagger
  - Adicionado arquivo `documentation.json` com a especificação da API
- Padronizado retorno para erros inesperados
  - Ajustado o formato de resposta para melhorar rastreamento e consistência

[1.5.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.5.0

## [1.4.0] - 05/05/2025

### Alterações
- Adicionada funcionalidade de deleção de URL encurtada (soft delete)
  - Endpoint para deletar URLs encurtadas, mantendo o registro (soft delete)
- Ajustadas consultas para não retornar URLs deletadas
  - Consultas agora ignoram URLs marcadas como deletadas (soft delete)
- Adicionada validação de força de senha
  - Requisitos de complexidade para senhas durante o cadastro de usuários

[1.4.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.4.0

## [1.3.0] - 05/05/2025

### Alterações
- Funcionalidade de atualização de URLs encurtadas
  - Endpoint para atualizar a URL original a partir de uma URL encurtada
  - Verificação de permissão: somente o criador pode editar a URL

[1.3.0]: https://github.com/RianMarlon/node-encurtador-url/releases/tag/v1.3.0

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
- Implementada geração de token JWT
- Implementado geração de hash para senhas de usuários

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
