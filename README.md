# Order Management API

Uma API de gerenciamento de pedidos construída com Node.js, Express e TypeScript.

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Git

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd order-management-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (JWT_SECRET, DATABASE_URL, etc.)

## Executando o projeto

### Modo de desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

### Iniciar em produção
```bash
npm start
```

## Estrutura do projeto

```
src/
├── middlewares/       # Middlewares (autenticação, etc)
├── modules/          # Módulos de negócio (orders, etc)
├── routes/           # Rotas da API
├── config/           # Configurações (JWT, banco de dados, etc)
└── app.ts           # Aplicação principal
```

## API Endpoints

### Autenticação
- `POST /auth/login` - Fazer login

### Pedidos
- `POST /orders` - Criar novo pedido (requer autenticação)
- `GET /orders` - Listar pedidos com paginação e filtros (requer autenticação)

## Tecnologias utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **JWT** - Autenticação baseada em tokens

## Licença

MIT