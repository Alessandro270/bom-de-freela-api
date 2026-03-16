# Bom de Freela

> Plataforma Digital de Freelancing — Especificação Técnica do MVP v1.0

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Perfis de Utilizador](#perfis-de-utilizador)
- [Funcionalidades do MVP](#funcionalidades-do-mvp)
- [Modelo de Dados](#modelo-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Páginas da Plataforma](#páginas-da-plataforma)
- [Arquitetura](#arquitetura)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Requisitos Não Funcionais](#requisitos-não-funcionais)
- [Regras de Negócio](#regras-de-negócio)
- [Fora do Escopo do MVP](#fora-do-escopo-do-mvp)

---

## Visão Geral

O **Bom de Freela** é uma plataforma digital de freelancing que conecta clientes com freelancers qualificados. Clientes publicam projetos e contratam profissionais, enquanto freelancers encontram oportunidades, submetem propostas e gerem os seus contratos.

---

## Stack Tecnológica

| Camada            | Tecnologia               | Função                                    |
| ----------------- | ------------------------ | ----------------------------------------- |
| **Frontend**      | NuxtJS 3                 | Framework Vue.js para SSR/SSG             |
| **Frontend**      | Pinia                    | Gestão de estado global                   |
| **Frontend**      | TailwindCSS              | Estilização utilitária e responsiva       |
| **Frontend**      | VeeValidate + Zod        | Validação de formulários no cliente       |
| **Frontend**      | useFetch / @nuxtjs/axios | Comunicação com a API REST                |
| **Backend**       | NestJS                   | Framework Node.js com arquitetura modular |
| **Backend**       | JWT                      | Autenticação stateless                    |
| **Backend**       | bcrypt                   | Hash seguro de senhas                     |
| **Backend**       | TypeORM                  | ORM para MySQL com migrações              |
| **Base de Dados** | MySQL                    | Banco de dados relacional principal       |
| **Backend**       | class-validator          | Validação dos DTOs da API                 |
| **Backend**       | Swagger (OpenAPI)        | Documentação automática da API            |
| **Backend**       | Nodemailer               | Envio de emails transacionais             |

---

## Perfis de Utilizador

| Perfil            | Descrição                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Administrador** | Gere toda a plataforma: utilizadores, projetos e pagamentos. Acesso via painel dedicado.                    |
| **Cliente**       | Perfil padrão ao criar conta. Publica projetos, recebe propostas, contrata freelancers e efetua pagamentos. |
| **Freelancer**    | Perfil opcional criado pelo utilizador. Submete propostas, executa projetos e recebe pagamentos.            |

> Um utilizador pode ter simultaneamente os perfis de Cliente e Freelancer.

---

## Funcionalidades do MVP

### 🔐 Autenticação e Conta

- Registo com nome, email e senha (mínimo 8 caracteres)
- Login via JWT com expiração configurável
- Recuperação de senha por email (link com expiração de 1h)
- Gestão de conta: alterar nome, email e senha

### 👤 Perfis

- **Cliente** — criado automaticamente no registo; campos: nome, descrição, foto de perfil
- **Freelancer** — criado voluntariamente; campos: título, bio, habilidades, NIF, telefone

### 📁 Projetos

- Publicação de projetos com: título, descrição, orçamento, categoria e habilidades necessárias
- Estados: `Aberto` → `Em Andamento` → `Concluído` / `Cancelado`
- Pesquisa com filtros por categoria, subcategoria e faixa de orçamento

### 📝 Propostas

- Envio de proposta com: valor, prazo estimado e mensagem
- Um freelancer só pode ter uma proposta ativa por projeto
- Estados: `Pendente` → `Aceite` / `Recusada` / `Retirada`
- Ao aceitar uma proposta, as restantes são automaticamente recusadas

### 📄 Contratos

- Criado automaticamente ao aceitar uma proposta
- Valor do contrato = valor da proposta aceite
- Estados: `Ativo` → `Concluído` / `Cancelado`
- Apenas o cliente pode marcar como Concluído

### 💳 Pagamentos

- Processados após conclusão do contrato
- Simulação interna no MVP (sem gateway real)
- Um contrato = um pagamento; valor não pode ser inferior ao acordado
- Extrato de pagamentos efetuados e recebidos

### ⭐ Avaliações

- Avaliação mútua após contrato Concluído
- Nota de 1 a 5 estrelas + comentário
- Cada parte avalia uma vez por contrato
- Média de avaliações calculada e exibida no perfil

### 🔔 Notificações

- Geradas pelo sistema para: nova proposta, proposta aceite/recusada, contrato criado, pagamento recebido, nova avaliação
- Estados: `Não lida` / `Lida`
- Marcar todas como lidas de uma só vez

### 🛠️ Administração

- Listar, pesquisar e filtrar utilizadores
- Ativar / desativar contas
- Gerir projetos e contratos
- Visualizar resumo de pagamentos

---

## Modelo de Dados

### Tabelas Principais

| Tabela                | Descrição                                      |
| --------------------- | ---------------------------------------------- |
| `users`               | Todos os utilizadores da plataforma            |
| `client_profiles`     | Perfil de cliente associado a um utilizador    |
| `freelancer_profiles` | Perfil de freelancer associado a um utilizador |
| `categories`          | Categorias e subcategorias (self-referencing)  |
| `projects`            | Projetos publicados pelos clientes             |
| `proposals`           | Propostas enviadas por freelancers             |
| `contracts`           | Contratos gerados automaticamente              |
| `payments`            | Registo de pagamentos                          |
| `reviews`             | Avaliações mútuas pós-contrato                 |
| `notifications`       | Notificações do sistema para utilizadores      |

### Relacionamentos

```
users ──1:1── client_profiles
users ──1:1── freelancer_profiles
client_profiles ──1:N── projects
projects ──N:1── categories (self-referencing para subcategorias)
projects ──1:N── proposals
freelancer_profiles ──1:N── proposals
proposals ──1:1── contracts
contracts ──1:1── payments
contracts ──1:N── reviews (máx. 2: um por parte)
users ──1:N── notifications
```

---

## Endpoints da API

### Autenticação — `/auth`

| Método | Rota                    | Descrição                    |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/auth/register`        | Registo de novo utilizador   |
| POST   | `/auth/login`           | Login e geração de JWT       |
| POST   | `/auth/forgot-password` | Solicitar reset de senha     |
| POST   | `/auth/reset-password`  | Definir nova senha via token |
| POST   | `/auth/logout`          | Invalidar token ativo        |

### Utilizadores — `/users`

| Método | Rota                 | Descrição               |
| ------ | -------------------- | ----------------------- |
| GET    | `/users/me`          | Dados da conta e perfis |
| PATCH  | `/users/me`          | Atualizar nome          |
| PATCH  | `/users/me/email`    | Alterar email           |
| PATCH  | `/users/me/password` | Alterar senha           |

### Perfis — `/profiles`

| Método | Rota                       | Descrição                      |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/profiles/client`         | Criar perfil de cliente        |
| GET    | `/profiles/client/:id`     | Ver perfil de cliente          |
| PATCH  | `/profiles/client`         | Atualizar perfil de cliente    |
| POST   | `/profiles/freelancer`     | Criar perfil de freelancer     |
| GET    | `/profiles/freelancer/:id` | Ver perfil de freelancer       |
| PATCH  | `/profiles/freelancer`     | Atualizar perfil de freelancer |
| GET    | `/profiles/freelancers`    | Pesquisar freelancers          |

### Projetos — `/projects`

| Método | Rota            | Descrição               |
| ------ | --------------- | ----------------------- |
| POST   | `/projects`     | Publicar projeto        |
| GET    | `/projects`     | Listar projetos abertos |
| GET    | `/projects/:id` | Detalhe do projeto      |
| PATCH  | `/projects/:id` | Editar projeto          |
| DELETE | `/projects/:id` | Cancelar projeto        |

### Propostas — `/proposals`

| Método | Rota                    | Descrição        |
| ------ | ----------------------- | ---------------- |
| POST   | `/proposals`            | Enviar proposta  |
| GET    | `/proposals/mine`       | Minhas propostas |
| PATCH  | `/proposals/:id`        | Editar proposta  |
| DELETE | `/proposals/:id`        | Retirar proposta |
| PATCH  | `/proposals/:id/accept` | Aceitar proposta |
| PATCH  | `/proposals/:id/reject` | Recusar proposta |

### Contratos — `/contracts`

| Método | Rota                      | Descrição                 |
| ------ | ------------------------- | ------------------------- |
| GET    | `/contracts`              | Listar contratos          |
| GET    | `/contracts/:id`          | Detalhe do contrato       |
| PATCH  | `/contracts/:id/complete` | Marcar como Concluído     |
| PATCH  | `/contracts/:id/cancel`   | Cancelar contrato (admin) |

### Pagamentos — `/payments`

| Método | Rota                | Descrição             |
| ------ | ------------------- | --------------------- |
| POST   | `/payments`         | Registar pagamento    |
| GET    | `/payments/history` | Extrato de pagamentos |
| GET    | `/payments/:id`     | Detalhe do pagamento  |

### Avaliações — `/reviews`

| Método | Rota                      | Descrição                   |
| ------ | ------------------------- | --------------------------- |
| POST   | `/reviews`                | Criar avaliação             |
| GET    | `/reviews/freelancer/:id` | Avaliações de um freelancer |
| GET    | `/reviews/client/:id`     | Avaliações de um cliente    |

### Notificações — `/notifications`

| Método | Rota                      | Descrição               |
| ------ | ------------------------- | ----------------------- |
| GET    | `/notifications`          | Listar notificações     |
| PATCH  | `/notifications/:id/read` | Marcar como lida        |
| PATCH  | `/notifications/read-all` | Marcar todas como lidas |

### Administração — `/admin`

| Método | Rota                             | Descrição                 |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/admin/users`                   | Listar utilizadores       |
| PATCH  | `/admin/users/:id/toggle-status` | Ativar/desativar conta    |
| GET    | `/admin/projects`                | Listar todos os projetos  |
| GET    | `/admin/contracts`               | Listar todos os contratos |
| GET    | `/admin/payments`                | Resumo financeiro         |

---

## Páginas da Plataforma

### Públicas

| Rota                        | Descrição             |
| --------------------------- | --------------------- |
| `/`                         | Landing Page          |
| `/login`                    | Formulário de login   |
| `/register`                 | Formulário de registo |
| `/forgot-password`          | Recuperação de senha  |
| `/reset-password?token=...` | Redefinição de senha  |
| `/about`                    | Sobre a plataforma    |
| `/contact`                  | Contacto              |

### Área Privada (Comum)

| Rota                | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `/dashboard`        | Resumo geral, notificações e ações rápidas |
| `/account/settings` | Gerir conta e criar perfil de freelancer   |
| `/notifications`    | Central de notificações                    |

### Área de Cliente

| Rota                        | Descrição                      |
| --------------------------- | ------------------------------ |
| `/client/profile`           | Perfil do cliente              |
| `/client/projects`          | Projetos publicados            |
| `/client/projects/new`      | Criar projeto                  |
| `/client/projects/:id`      | Detalhe do projeto e propostas |
| `/client/projects/:id/edit` | Editar projeto                 |
| `/client/contracts`         | Contratos do cliente           |
| `/client/contracts/:id`     | Detalhe do contrato            |
| `/client/payments`          | Extrato de pagamentos          |
| `/freelancers`              | Pesquisa de freelancers        |
| `/freelancers/:id`          | Perfil público do freelancer   |

### Área de Freelancer

| Rota                        | Descrição                              |
| --------------------------- | -------------------------------------- |
| `/freelancer/profile`       | Perfil do freelancer                   |
| `/freelancer/profile/edit`  | Editar perfil                          |
| `/freelancer/projects`      | Pesquisa de projetos                   |
| `/freelancer/projects/:id`  | Detalhe do projeto e envio de proposta |
| `/freelancer/proposals`     | Propostas enviadas                     |
| `/freelancer/contracts`     | Contratos do freelancer                |
| `/freelancer/contracts/:id` | Detalhe do contrato                    |
| `/freelancer/payments`      | Extrato de pagamentos recebidos        |

### Painel de Administração

| Rota               | Descrição                  |
| ------------------ | -------------------------- |
| `/admin/dashboard` | Resumo geral da plataforma |
| `/admin/users`     | Gestão de utilizadores     |
| `/admin/users/:id` | Detalhe do utilizador      |
| `/admin/projects`  | Todos os projetos          |
| `/admin/contracts` | Todos os contratos         |
| `/admin/payments`  | Todos os pagamentos        |

---

## Arquitetura

### Módulos NestJS (Backend)

```
AuthModule         — Registo, login, recuperação de senha, guards JWT
UsersModule        — Gestão de conta e dados do utilizador
ProfilesModule     — Criação e atualização de perfis (cliente e freelancer)
ProjectsModule     — CRUD de projetos, pesquisa e filtros
ProposalsModule    — Envio, edição, aceitação e recusa de propostas
ContractsModule    — Ciclo de vida dos contratos
PaymentsModule     — Registo e extrato de pagamentos
ReviewsModule      — Avaliações pós-contrato
NotificationsModule — Criação e consulta de notificações
CategoriesModule   — Gestão de categorias e subcategorias
AdminModule        — Endpoints restritos com guard de role Admin
```

### Stores Pinia (Frontend)

```
useAuthStore          — token JWT, dados do utilizador, login/logout
useProfileStore       — perfil de cliente e freelancer
useProjectsStore      — lista de projetos, filtros, projeto ativo
useProposalsStore     — propostas do freelancer ou projeto ativo
useContractsStore     — contratos ativos do utilizador
useNotificationsStore — lista de notificações e contador de não lidas
```

---

## Variáveis de Ambiente

```env
# Base de Dados
DATABASE_URL=Mysql://user:password@localhost:5432/bom_de_freela

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Email (SMTP)
MAIL_HOST=smtp.example.com
MAIL_USER=your_email@example.com
MAIL_PASS=your_password

# URLs
APP_URL=https://bomdefreela.pt
API_URL=https://api.bomdefreela.pt
```

---

## Requisitos Não Funcionais

| Código | Requisito                                                                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| RNF-01 | **Segurança** — JWT + bcrypt + HTTPS obrigatório                                                           |
| RNF-02 | **Desempenho** — Respostas da API < 500ms; paginação em listagens > 20 registos                            |
| RNF-03 | **Disponibilidade** — 99% uptime; deploy com capacidade de rollback                                        |
| RNF-04 | **Escalabilidade** — Arquitetura modular NestJS preparada para crescimento                                 |
| RNF-05 | **Usabilidade** — Interface responsiva (desktop e mobile); mensagens de erro claras                        |
| RNF-06 | **Manutenibilidade** — Testes unitários nos módulos críticos; documentação via Swagger                     |
| RNF-07 | **Compatibilidade** — Chrome, Firefox, Safari (últimas 2 versões)                                          |
| RNF-08 | **Auditoria** — `created_at` e `updated_at` em todas as tabelas; soft delete nos registos críticos         |
| RNF-09 | **Autorização** — Guards de acesso por papel (Admin, Cliente, Freelancer) em todos os endpoints protegidos |
| RNF-10 | **Internacionalização** — Português (PT) como língua principal do MVP                                      |

---

## Regras de Negócio

### Utilizadores e Perfis

- Um utilizador recebe automaticamente o perfil de **Cliente** ao criar conta
- Um utilizador pode criar adicionalmente um perfil de **Freelancer**
- Não é possível ter dois perfis do mesmo tipo
- Para ativar o perfil de Freelancer, **NIF e telefone são obrigatórios**
- A desativação pelo admin bloqueia o login e todas as ações na plataforma

### Projetos

- Apenas utilizadores com perfil de Cliente podem publicar projetos
- O orçamento inicial deve ser um valor positivo
- Um projeto só pode ser editado no estado **Aberto**
- Um projeto com contrato ativo não pode ser cancelado

### Propostas

- Apenas utilizadores com perfil de Freelancer podem submeter propostas
- Um freelancer não pode propor ao seu próprio projeto (perfil duplo)
- Um freelancer só pode ter **uma proposta ativa** por projeto
- Ao aceitar uma proposta, o projeto passa a **Em Andamento** e as demais ficam **Recusadas**
- Uma proposta não pode ser editada após aceite ou recusada

### Contratos

- O contrato é gerado **automaticamente** ao aceitar uma proposta
- O valor do contrato é o valor da proposta aceite
- Apenas o cliente pode marcar o contrato como **Concluído**
- Um contrato Cancelado não pode ser reativado

### Pagamentos

- O pagamento só pode ser processado para contratos **Concluídos**
- Apenas o cliente efetua pagamento (cliente → freelancer)
- Um contrato só pode ter **um pagamento** registado
- O valor pago não pode ser inferior ao valor do contrato

### Avaliações

- Avaliações só podem ser criadas após o contrato estar **Concluído**
- Cliente avalia o freelancer e freelancer avalia o cliente — são independentes
- Cada parte só pode criar **uma avaliação** por contrato
- A nota deve ser um inteiro entre **1 e 5**

---

## Fora do Escopo do MVP

- Perfis de empresa / agências de freelancers
- Notificações em tempo real (WebSockets)
- Sistema de mensagens/chat entre utilizadores
- Múltiplos cartões de pagamento salvos
- Disputas e mediação de conflitos
- Relatórios e analytics avançados
- Integração com redes sociais para login

---

_Bom de Freela MVP v1.0 — Confidencial_
