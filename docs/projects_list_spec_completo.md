# Projects List — Spec Completo (/projects) — Visual + Funcional + Técnico — v1

> Documento único para a **página de Lista de Projetos**. Consolida UX, UI visual, comportamento, integrações técnicas com **Clerk + Supabase (RLS)**, telemetria, testes e DoD.

---

## 1) Visão Geral
- **Rota:** `/projects`
- **Objetivo:** exibir e gerenciar os **projetos** do usuário, permitindo criar novo projeto a partir de **templates** (MVP: `site-app`) e navegar ao Canvas.
- **Contexto com ProjectGate:** usuários **novos (0 projetos)** normalmente **não veem** esta página na primeira sessão, pois o `/post-auth` cria um **draft** e redireciona ao Canvas. `/projects` é o **hub** para usuários com ≥1 projeto, ou quando navegam de volta.

---

## 2) User Stories
- **US‑P01** Ver **todos meus projetos** com nome, status, última edição.
- **US‑P02** **Criar** um novo projeto rapidamente a partir do template **Site/App**.
- **US‑P03** **Buscar** por nome e **ordenar** resultados.
- **US‑P04** **Renomear**, **Duplicar** e **Arquivar** projetos.
- **US‑P05** Estado vazio claro com CTA para começar.

---

## 3) Fluxos
### 3.1 Abertura da página
1) Usuário autenticado visita `/projects` → carregar lista (CSR/SSR).  
2) Mostrar **ProjectGrid** com tiles e ações.

### 3.2 Criar novo projeto
1) Clique em **Novo projeto** → abre **NewProjectModal**.  
2) Campos: **Template** (default `Site/App`), **Nome** (default `Untitled Project`).  
3) Confirmar → **insert** no Supabase → **redirect** para `/projects/:id?onboarding=1`.

### 3.3 Abrir projeto existente
- Clique no tile → `/projects/:id` (Canvas).

### 3.4 Renomear / Duplicar / Arquivar
- Ações pelo **ProjectTileMenu** (kebab).  
- **Renomear**: inline dialog.  
- **Duplicar**: cria novo registro com sufixo `(copy)`.  
- **Arquivar**: muda `status` para `archived`; some do filtro *Active*.

### 3.5 Busca/Ordenação/Filtro
- **Busca**: por nome (ILIKE).  
- **Ordenar**: `updated_at desc` (padrão) | `name asc` | `name desc`.  
- **Filtro de status**: `active` (default) | `archived`.

---

## 4) Informação & Dados
**Campos por tile:** `id`, `name`, `status (draft|active|archived)`, `updated_at`.  
**Derived:** `lastEditedRelative` (ex.: "há 3h").

**Regras:**  
- `draft` e `active` aparecem no filtro *Active*.  
- `archived` aparece somente no filtro *Archived*.

---

## 5) UI/UX — Layout & Componentes
- **ProjectsPage**
  - **ProjectsHeader**
    - **PageTitle**: “Seus Projetos”
    - **NewProjectButton** (primário)
    - **TemplatePickerInline** (opcional; default `Site/App`)
  - **ProjectFilters**
    - **SearchInput** (debounce 300ms)
    - **SortDropdown** (Recentes, A‑Z, Z‑A)
    - **StatusFilter** (Active, Archived)
  - **ProjectGrid**
    - **ProjectTile** (card clicável)
      - **ProjectTileMeta** (status chip + última edição)
      - **ProjectTileMenu** (… actions)
    - **ProjectTileSkeleton** (carregamento)
  - **EmptyStateCreateFirstProject** (quando sem itens)
  - **Pagination** (cursor-based)

### 5.1 Design (dark theme)
- **Grid:** 3–4 colunas ≥1280px; 2 colunas ≥1024px; 1 coluna em mobile. Gap 16–24px.  
- **Tile:** `background: var(--bg-elev)`, `border: 1px solid var(--stroke)`, `border-radius: 12px`, `box-shadow: var(--shadow-1)`, padding 16px.  
- **Nome:** 16px/600 `var(--text)`; **meta:** 12–13px `var(--text-dim)`.  
- **Status chip:** `READY`/`DRAFT` não se aplicam no projeto; usar **status do projeto**:  
  - **draft**: chip cinza (`--text-dim` + border `--stroke`)  
  - **active**: chip `--success` leve (contorno + texto)  
  - **archived**: chip `--danger` leve  
- **Hover do tile:** leve elevação + borda `#2B3042`.  
- **Focus visível:** outline 2px `--primary` com offset.

### 5.2 Empty State
- Ilustração discreta (opcional).  
- Texto: “Nenhum projeto por aqui.”  
- CTA: **Criar primeiro projeto** (abre modal).  
- Dica: “Você pode começar com o template Site/App”.

### 5.3 Microcopy
- Header: “Seus Projetos”  
- Botão: “Novo projeto”  
- Menu: “Abrir”, “Renomear”, “Duplicar”, “Arquivar”  
- Empty: “Nenhum projeto por aqui. Vamos começar um?”

---

## 6) Acessibilidade
- Tiles com **role="button"** + `aria-label="Abrir projeto {name}"`.  
- Menus com ARIA: `aria-haspopup="menu"`, setas para navegar, Esc fecha.  
- Foco visível em tiles e botões.  
- Touch targets ≥ 44px.  
- Contraste AA.

---

## 7) Integração Técnica — Supabase + Clerk

### 7.1 Estrutura de tabela (resumo)
`projects { id uuid pk, name text, template_id text, status text, owner_id text default (auth.jwt()->>'sub'), graph jsonb, created_at tstz, updated_at tstz }`

### 7.2 RLS (policies) resumidas
- **SELECT/INSERT/UPDATE/DELETE** permitidos apenas quando `projects.owner_id = auth.jwt()->>'sub'`.

### 7.3 Índices sugeridos
```sql
create index if not exists idx_projects_owner_updated on projects(owner_id, updated_at desc);
create index if not exists idx_projects_owner_status on projects(owner_id, status);
create index if not exists idx_projects_owner_name on projects(owner_id, name);
```

### 7.4 Fetch (SSR – App Router)
```tsx
// app/projects/page.tsx (Server Component)
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

async function supabaseSsr(){
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: { fetch: (url, opts:any={}) => {
      const headers = new Headers(opts.headers); if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetch(url, { ...opts, headers });
    }}
  })
}

export default async function ProjectsPage(){
  const sb = await supabaseSsr()
  const { data: items } = await sb
    .from('projects')
    .select('id,name,status,updated_at')
    .order('updated_at', { ascending: false })
    .limit(24)
  // Render grid com items
}
```

### 7.5 CSR com busca/ordenar/paginação
```ts
// Query shape (client)
await sb.from('projects')
  .select('id,name,status,updated_at')
  .ilike('name', `%${query}%`)
  .eq('status', statusFilter === 'archived' ? 'archived' : undefined) // aplicar só quando definido
  .order(sortKey === 'name' ? 'name' : 'updated_at', { ascending: sortKey === 'name_asc' })
  .range(from, to) // ou paginação por cursor com updated_at & id
```

### 7.6 Criação de projeto (modal → redirect)
```ts
const { data, error } = await sb
  .from('projects')
  .insert({ name, template_id: 'site-app', status: 'draft' })
  .select('id')
  .single()
if(!error) router.push(`/projects/${data.id}?onboarding=1`)
```

### 7.7 Duplicar / Arquivar / Renomear
```ts
// Duplicar
const { data: original } = await sb.from('projects').select('*').eq('id', id).single()
await sb.from('projects').insert({
  name: `${original.name} (copy)`, template_id: original.template_id, status: 'draft', graph: original.graph
})

// Arquivar
await sb.from('projects').update({ status: 'archived' }).eq('id', id)

// Renomear
await sb.from('projects').update({ name: newName }).eq('id', id)
```

---

## 8) Paginação, Busca e Ordenação (detalhes)
- **Busca**: usar `ilike('name', '%term%')`; debounced 300ms.
- **Ordenação**: por `updated_at desc` (default), `name asc/desc`.
- **Paginação**:
  - **Range**: `.range(offset, offset+limit-1)` (mais simples).  
  - **Cursor** (recomendado): usar par `(updated_at, id)` como cursor para estabilidade; manter `order('updated_at', { ascending: false }).order('id')`.

---

## 9) Estados, Erros & Empty
- **Loading:** `ProjectTileSkeleton` (6–12 itens).  
- **Erro de rede:** banner “Não foi possível carregar projetos. Tente novamente.”  
- **Empty geral:** `EmptyStateCreateFirstProject` + CTA.  
- **Empty pós‑filtros/busca:** “Sem resultados para ‘{q}’”.

---

## 10) Telemetria
Eventos:  
- `projects_view`  
- `project_created` `{ templateId }`  
- `project_opened` `{ projectId }`  
- `project_archived` `{ projectId }`  
- `project_duplicated` `{ projectId, newId }`  
- `projects_search_used` `{ q }`  
- `projects_sort_changed` `{ key }`  
- `projects_status_filter_changed` `{ status }`

---

## 11) Performance
- SSR inicial para **perceived speed**; revalidate sob demanda (ou CSR puro com skeletons).  
- Índices conforme §7.3.  
- Debounce de busca (300ms).  
- Evitar **N+1** (list apenas campos necessários).  
- Cache leve de última página no client.

---

## 12) Segurança
- **Clerk** gerencia sessão (cookies `HttpOnly`, `Secure`).  
- **RLS** garante isolamento dos dados.  
- Nenhuma ação client‑side sem checagem do Supabase.  
- **Rate limiting** opcional em ações (duplicar/arquivar) via middleware/API.

---

## 13) Testes
- **E2E:** exibir lista; criar projeto; abrir projeto; renomear/duplicar/arquivar; filtros/busca.  
- **Integração:** policies RLS (o usuário A não vê dados do B).  
- **Visual/A11y:** contraste AA; foco visível; navegação por teclado nos tiles e menus.

---

## 14) Definition of Done (DoD)
- Lista renderiza rápida com skeletons;
- Criar/abrir/renomear/duplicar/arquivar funcionando;
- Busca/ordenar/paginação estáveis;
- A11y AA;
- Telemetria ativa;
- RLS validada;
- E2E/integração passando.

---

## 15) Checklist de Implementação
- [ ] Componente **ProjectsPage** (SSR + CSR para interações)
- [ ] **NewProjectModal** com template default `site-app`
- [ ] **ProjectTile** + **ProjectTileMenu** (ações)
- [ ] Busca/Ordenar/StatusFilter com persistência na URL (querystring)
- [ ] Supabase helpers (SSR/CSR) prontos
- [ ] Índices SQL aplicados; policies revisadas
- [ ] Telemetria + QA A11y + testes E2E

---

## 16) Futuro (fora do MVP)
- **Tags** por projeto e filtro por tags.  
- **Favoritos/Pinned**.  
- **Compartilhamento/colaboração** (roles).  
- **Bulk actions** (multi‑seleção).  
- **Import/Export** de projetos.

