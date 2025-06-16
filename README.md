# Mural de Ideias Backend

Backend API para o sistema de Mural de Ideias, desenvolvido com NestJS.

[![Coverage Status](https://coveralls.io/repos/github/SantanaDeveloper/sinky-ideas-backend/badge.svg?branch=main)](https://coveralls.io/github/SantanaDeveloper/sinky-ideas-backend)
[![CI](https://github.com/santanadeveloper/sinky-ideas-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/santanadeveloper/sinky-ideas-backend/actions/workflows/ci.yml)

---

## Requisitos

- Node.js (versão 20 ou superior)
- npm ou yarn
- SQLite (para desenvolvimento)

## Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/SantanaDeveloper/sinky-ideas-backend]
cd sinky-ideas-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DATABASE_TYPE=sqlite
DATABASE_NAME=db.sqlite
DB_SYNC=true
LOGGING=false
JWT_SECRET=sua_chave_secreta_aqui
```

## Executando o Projeto

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

## Documentação da API

A documentação da API está disponível em `/api` quando o servidor estiver rodando. Ela é gerada automaticamente usando Swagger/OpenAPI.

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Estrutura do Projeto

- `src/` - Código fonte
  - `auth/` - Autenticação e autorização
  - `ideas/` - Gerenciamento de ideias
  - `users/` - Gerenciamento de usuários
  - `seed/` - Dados iniciais do sistema

## Usuário Padrão

Um usuário administrador é criado automaticamente ao iniciar a aplicação:
- Username: admin
- Senha: admin123

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
