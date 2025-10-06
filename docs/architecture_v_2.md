# Architecture — v2.2 (Supabase + Clerk)

> Atualização do plano de arquitetura para **usar Supabase como banco de dados (Postgres gerenciado)**, mantendo **Clerk** como autenticação e **Canvas** com cards inteligentes. Inclui **RLS**, padrão de acesso (CSR/SSR), migrações e contratos.

---

## 1) Visão Geral do Sistema
- **Frontend**: Next.js (App Router), React, Tailwind + shadcn/ui.
- **Auth**: **Clerk** (SignIn/SignUp, sessão, UI).
- **DB**: **Supabase (Postgres)** com **Row‑Level Security (RLS)**.
- **Data Access**: `@supabase/supabase-js` com injeção do **token do Clerk** (template `supabase`) no header `Authorization`.
- **IA**: serviço server‑side (AIGenerationService).
- **Outputs**: PRD, Prompt Pack, Work Plan (OutputService).

```mermaid
flowchart LR
  U[Usuário]-->|SignIn/SignUp| Clerk
  U-->|/projects /projects/:id| FE[Next.js]
  FE-->|supabase-js (Clerk token)| SB[(Supabase Postgres)]
  FE-->|Route Handlers| API[(Backend API)]
  API-->|Contexto + Prompt| AI[AIGenerationService]
  API-->|compila| OUT[OutputService]
```

---

## 2) Páginas & Rotas
- **/sign-in**, **/sign-up** (ou **/auth**) — Clerk
- **/post-auth** — ProjectGate pós‑login (SSR)
- **/projects** — lista
- **/projects/:id** — canvas
- **/outputs/:id** — opcional (viewer)

**Proteção**: `clerkMiddleware` + wrappers `<SignedIn/>/<SignedOut/>`.

---

## 3) ProjectGate (/post-auth)
SSR que verifica projetos do usuário no **Supabase** e decide destino.

**Regra:** se não há projetos → cria **draft** (template "site-app") e redireciona para `/projects/:id?onboarding=1`; senão `/projects`.

> Implementar com supabase‑js (server) usando token do Clerk via `auth().getToken({ template: 'supabase' })`.

---

## 4) Supabase — RLS & Políticas

### 4.1 Modelagem (tabelas principais)
- **projects** `{ id uuid pk, name text, template_id text, status text, owner_id text default (auth.jwt()->>'sub'), graph jsonb, created_at timestamptz, updated_at timestamptz }`
- **cards** `{ id uuid pk, project_id uuid, stage_key text, type_key text, title text, summary text, fields jsonb, status text, x int, y int, w int, h int, created_at, updated_at }`
- **edges** `{ id uuid pk, project_id uuid, source_card_id uuid, target_card_id uuid, label text }`
- **outputs** `{ id uuid pk, project_id uuid, template_id text, type text, content jsonb, created_at }`
- **ai_traces** `{ id uuid pk, card_id uuid, prompt text, model text, tokens int, cost numeric, created_at }`

> Observação: **owner_id** guarda o **Clerk userId** (claim `sub`) via `default auth.jwt()->>'sub'`.

### 4.2 Habilitar RLS
```sql
alter table projects enable row level security;
alter table cards enable row level security;
alter table edges enable row level security;
alter table outputs enable row level security;
```

### 4.3 Policies (exemplos)
```sql
-- O dono pode ver seus projetos\create policy "read_own_projects"
  on projects for select to authenticated
  using ((auth.jwt()->>'sub') = owner_id);

-- O dono pode inserir projetos em seu nome
create policy "insert_own_projects"
  on projects for insert to authenticated
  with check ((auth.jwt()->>'sub') = owner_id);

-- Cards pertencem a projetos do dono
create policy "read_project_cards"
  on cards for select to authenticated
  using (exists (
    select 1 from projects p
    where p.id = cards.project_id
      and p.owner_id = auth.jwt()->>'sub'));

create policy "mutate_project_cards"
  on cards for all to authenticated
  using (exists (
    select 1 from projects p
    where p.id = cards.project_id
      and p.owner_id = auth.jwt()->>'sub'))
  with check (exists (
    select 1 from projects p
    where p.id = cards.project_id
      and p.owner_id = auth.jwt()->>'sub'));
```

> Replicar padrão para **edges** e **outputs**.

---

## 5) Acesso a Dados (supabase‑js)

### 5.1 Client‑side (CSR)
- Criar um helper `createClerkSupabaseClient()` que injeta `Authorization: Bearer <Clerk token (template 'supabase')>` em cada request.
- Usar `useUser()` + `useSession()` (Clerk) para obter o token quando necessário.

### 5.2 Server‑side (SSR / Route Handlers)
- Helper `createClerkSupabaseClientSsr()` usando `auth().getToken({ template: 'supabase' })` e setando o header `Authorization`.
- **Service‑role** (`SUPABASE_SERVICE_ROLE_KEY`) apenas para rotinas administrativas sem contexto do usuário (evitar bypass RLS em fluxos do app).

---

## 6) Migrações & Infra
- **Migrations**: **Supabase CLI** + SQL (schema, índices, policies RLS).
- **Seeds**: inserir **template "Site/App"** (stages + card types) na tabela `templates`.
- **Env**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server), `CLERK_*`.

---

## 7) Graph & Canvas
- **GraphJSON (v1)** mantido em `projects.graph` (cache/snapshot de render). Fonte da verdade continua sendo **cards/edges**.
- Debounce (~800ms) para persistir posição/tamanho.

---

## 8) Serviços de Domínio
- **ContextService**: agrega Ideia Base + resumos (READY) do Supabase (paginado) e comprime para prompt.
- **AIGenerationService**: gera/expande/revisa `fields` respeitando schema do card.
- **OutputService**: compila **Work Plan**, **PRD**, **Prompt Pack** (markdown/json) a partir do Supabase.
- **CompletionService**: calcula progresso e gate (≥2 READY) para Work Plan.

---

## 9) Endpoints (Next Route Handlers)
- `GET /projects/:id`
- `GET /projects/:id/cards`
- `POST /cards`
- `PATCH /cards/:id`
- `POST /cards/:id/generate`
- `GET /projects/:id/context`
- `POST /outputs/:type`

> Internamente, cada handler usa **supabase‑js** com o token do usuário (RLS). Operações privilegiadas: usar **service‑role** com parcimônia.

---

## 10) Performance & Observabilidade
- **Índices**: `(owner_id)` em `projects`; `(project_id, status)` em `cards`; `(project_id)` em `edges/outputs`.
- **Telemetria** (PostHog/Segment): eventos do fluxo + latência das queries Supabase.
- **Cotas**: monitorar limites de linhas/armazenamento e rate limits do projeto.

---

## 11) Testes
- **Unit**: policies de RLS (queries simuladas), validação de schema por card type.
- **Integration**: ProjectGate criando projeto com token do usuário (não service‑role), geração de card, output.
- **E2E**: Sign‑in → /post-auth → Canvas; checklist → cards; gate do Work Plan; PRD/Prompt Pack.

---

## 12) ADRs
1. **Supabase como DB** com **RLS**; **Clerk** fornece identidade (claim `sub`).
2. **Acesso via supabase‑js** com token do Clerk (template `supabase`) — evita acoplamento a Prisma e respeita RLS.
3. **Service‑role** apenas para tarefas administrativas.
4. **Gate Work Plan** (≥2 READY) permanece inalterado.

---

## 13) Anexos — Helpers (pseudo‑código)

```ts
// client/csr
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'

export function createClerkSupabaseClient() {
  const { session } = useSession()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await session?.getToken({ template: 'supabase' })
        const headers = new Headers(options?.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(url, { ...options, headers })
      },
    },
  })
}
```

```ts
// server/ssr
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export function createClerkSupabaseClientSsr() {
  const { getToken } = auth()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await getToken({ template: 'supabase' })
        const headers = new Headers(options?.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(url, { ...options, headers })
      },
    },
  })
}
```

---

## 14) Roadmap
- **S1**: migrações SQL + policies; helpers CSR/SSR; ProjectGate/Canvas operando com RLS.
- **S2**: otimizações de contexto/queries; Edge Functions para jobs pesados (opcional); monitoramento de custos (AI + DB).

