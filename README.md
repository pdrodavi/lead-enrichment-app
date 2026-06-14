# Lead Enrichment App - Frontend Web

Aplicação frontend em **Node.js/Express** que consome a **Lead Enrichment API** (back-end Java descrito em `openapi.yaml`) para enriquecer leads com dados públicos da internet.

## Funcionalidades

- 📊 **Listagem** de leads enriquecidos com paginação e ordenação
- 🔍 **Enriquecimento** de leads via API (DNS, RDAP, tecnologias, redes sociais)
- ✏️ **Edição** e reenriquecimento de leads
- 🗑️ **Exclusão** permanente de leads (hard delete)
- 🔎 **Busca por domínio** com paginação
- 📱 Layout responsivo com Tailwind CSS

## Pré-requisitos

- **Node.js** 20+ ou **Docker**
- **Back-end Java** rodando (opcional para desenvolvimento local) ou acesso à API de produção

## Configuração Rápida (Local)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/Mac

# 3. Editar .env com sua chave de API
#    LEAD_ENRICHMENT_API_KEY=sua-chave
#    LEAD_ENRICHMENT_API_URL=http://localhost:8081/api/v1/leads

# 4. Iniciar servidor
npm start
# Acessar: http://localhost:3000
```

## Desenvolvimento

```bash
npm run dev
# Inicia com nodemon para hot-reload
```

## Docker

```bash
docker compose up -d
# Acessar: http://localhost:3032
```

## Endpoints da API Consumidos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Página principal (lista leads) |
| `POST` | `/enrich` | Enriquecer novo lead |
| `GET` | `/:id` | Detalhes do lead (JSON) |
| `PUT` | `/:id` | Atualizar lead (JSON) |
| `DELETE` | `/:id` | Excluir lead (JSON) |
| `GET` | `/domain/:domain` | Buscar por domínio (JSON) |

A view consome a API descrita em [`openapi.yaml`](./openapi.yaml).
