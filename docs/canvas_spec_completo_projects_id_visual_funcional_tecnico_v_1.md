# Canvas — Spec Completo (/projects/:id) — Visual + Funcional + Técnico — v1

> Documento único para a página **Canvas do Projeto**. Consolida **UX**, **UI/visual**, **regras de negócio**, **integração técnica (Clerk + Supabase + IA)**, **telemetria**, **testes** e **DoD**. MVP focado no template **“Site/App”**.

---

## 1) Visão Geral
- **Rota:** `/projects/:id`
- **Objetivo:** permitir que o usuário estruture sua ideia em **cards por etapa**, utilizando **IA com contexto do projeto**, conecte conceitos e gere **outputs** (Work Plan, PRD, Prompt Pack).
- **Pós‑auth:** usuários novos chegam via `/projects/:id?onboarding=1` após o **ProjectGate** criar um draft.

---

## 2) User Stories (MVP)
- **US‑C01** Criar **Ideia Base** e abrir um **checklist** com as próximas etapas.
- **US‑C02** Ao clicar numa etapa, **gerar** um card pré‑preenchido por IA, **editar** e **confirmar**.
- **US‑C03** Visualizar **progresso do template** e saber o que falta.
- **US‑C04** **Gerar Outputs** (Work Plan/PRD/Prompt Pack) quando os pré‑requisitos forem cumpridos.
- **US‑C05** Ligar cards (opcional) para explicar relações.

---

## 3) Fluxos do Usuário

### 3.1 Onboarding do Canvas (primeiro acesso do projeto)
1. Chegada com `?onboarding=1` → abrir **OnboardingModal**.
2. Opções: **Gerar do zero** | **Aprimorar minha ideia**.
3. Usuário descreve a ideia (textarea curto) → cria **card Ideia Base**.
4. Exibir **StageChecklist** no card Ideia Base (itens clicáveis).

### 3.2 Gerar cards por etapa
1. Clique em item do **checklist** → cria o card da etapa (DRAFT) e abre o **AIPanel**.
2. **AIPanel / Generate**: IA gera `fields` com base no **ContextService** (Ideia Base + cards READY resumidos) e no **schema** do card.
3. Usuário edita, **Apply** → salva DRAFT. Em seguida **Confirmar** → `status=READY`.
4. **Review**: IA verifica consistência entre esse card e os já READY (ex.: dependências de features x stack).

### 3.3 Gate para Work Plan e Outputs
- **Work Plan**: habilita quando `readyCount >= 2` (quaisquer etapas).
- **PRD** e **Prompt Pack**: sem gate adicional (mas melhor qualidade com mais READY).
- Outputs abrem em **OutputsModal** com **Copy** e **Download**.

### 3.4 Conexões entre cards (opcional MVP)
- Arrastar de um card para outro para criar **Edge** com rótulo.
- Usado para dar visibilidade de dependências e relações.

---

## 4) UI / Visual

### 4.1 Layout Geral
- **CanvasShell** (toolbar topo + viewport central + painel direito dockável para IA)
- **Toolbar**: ZoomIn/ZoomOut, Fit, GridToggle, SnapToggle
- **Viewport**: pan/zoom, grid leve, snapping
- **AIPanel** (dock à direita, 320–400px; recolhível)

### 4.2 Card (anatomia)
- **Header**: ícone da etapa (cor de acento), título (H3, editável), **StatusBadge** (Draft/Ready), menu (…)
- **Body**: campos estruturados do **schema** do card‑type
- **Footer**: timestamps, links, contador de conexões, **AITrace** compacto
- **Borda esquerda** de 2–3px com a **cor da etapa** (Ideia/Entendimento/Escopo/Design/Tecnologia/Planejamento)

### 4.3 AIPanel
- **AIModeSwitcher**: **Generate**, **Expand**, **Review**
- **PromptPreview** (monoespaçada 12–13px)
- **DiffViewer**: highlight leve (verde = adições, vermelho = remoções)
- **ApplyChangesButton**

### 4.4 Estados & Feedback
- **Draft vs Ready**: Ready tem badge + leve brilho da borda de etapa
- **Autosave**: “Salvando…” / “Salvo” no topo (SaveIndicator)
- **Skeletons**: cards fantasma; chat com bolhas ghost

> Cores/tokens tipográficos seguem o **Guia Visual**.

---

## 5) Componentes (MVP)
- **CanvasShell**, **CanvasToolbar**, **CanvasViewport**, **MiniMap** (opcional)
- **Card** (wrapper)
  - **IdeaBaseCard**: **IdeaFields** (Nome, Pitch, Problema, Público, Valor, KPIs, Riscos) + **StageChecklist** + **WorkPlanButton** (desabilitado até ≥2 READY)
  - **UnderstandingDiscoveryCard**, **UnderstandingValuePropCard**
  - **ScopeFeaturesCard**, **ScopeRequirementsCard**
  - **DesignConceptCard**, **DesignFlowCard**
  - **TechStackCard**, **TechArchCard**
  - **PlanReleaseCard**, **PlanRoadmapCard**
- **AIPanel** (Generate/Expand/Review + DiffViewer)
- **ProgressDrawer** (progresso por etapa)
- **OutputsModal** (PRD | Prompt Pack | Work Plan)
- **ChatThread** (contextual), **ChatInput**
- **ConnectionOverlay** (arrastar ligação)
- **VersionHistoryPanel** (snapshot simples por card)

---

## 6) Regras de Negócio
- **Checklist (Ideia Base)**: item fica **Done** somente quando o card correspondente vira `READY`.
- **Gate Work Plan**: `readyCount >= 2` → habilita botão/aba.
- **Cross‑propagação**: confirmar `scope.features` sugere telas em `design.flow` e stack em `tech.stack`.
- **Revision**: ao confirmar card, rodar **Review** e sinalizar conflitos.
- **Undo/Redo**: nível projeto (histórico das alterações estruturais). 

---

## 7) Dados & Schemas

### 7.1 Tabelas (Supabase – resumo)
- **projects** `{ id, name, template_id, status, owner_id, graph, created_at, updated_at }`
- **cards** `{ id, project_id, stage_key, type_key, title, summary, fields jsonb, status('DRAFT'|'READY'), x,y,w,h, version int, created_at, updated_at }`
- **edges** `{ id, project_id, source_card_id, target_card_id, label }`
- **outputs** `{ id, project_id, template_id, type, content jsonb, created_at }`
- **ai_traces** `{ id, card_id, prompt, model, tokens, cost, created_at }`

### 7.2 GraphJSON (cache de render)
```ts
interface GraphJSON {
  version: 1;
  viewport: { x:number; y:number; zoom:number };
  nodes: Array<{ id:string; position:{x:number;y:number}; size:{w:number;h:number}; stageKey:string; typeKey:string; status:'DRAFT'|'READY'; }>;
  edges: Array<{ id:string; sourceCardId:string; targetCardId:string; label?:string }>;
}
```

### 7.3 Exemplos de schemas de `fields`
```ts
// idea.base
{
  name: string, pitch: string, problem: string, audience: string,
  valueProp: string, kpis: string[], risks: string[]
}
// scope.features (MoSCoW)
{
  suggestions: Array<{ id:string, title:string, rationale?:string, moscow:'must'|'should'|'could'|'wont', dependsOn?:string[] }>,
  selected: string[]
}
// tech.stack
{
  frontend:{ framework:string, pros:string[], cons:string[] },
  backend:{ language:string, framework?:string, pros?:string[], cons?:string[] },
  db:{ type:string, engine:string },
  integrations:string[], risks:string[]
}
```

---

## 8) Integração Técnica (Clerk + Supabase)

### 8.1 Carregar projeto/cards (SSR – App Router)
```tsx
// app/projects/[id]/page.tsx (Server Component)
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

async function supabaseSsr(){
  const { getToken } = auth(); const token = await getToken({ template: 'supabase' });
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global:{ fetch:(url, opts:any={})=>{ const h=new Headers(opts.headers); if(token) h.set('Authorization',`Bearer ${token}`); return fetch(url,{...opts,headers:h}); }}
  })
}

export default async function CanvasPage({ params }:{ params:{ id:string } }){
  const sb = await supabaseSsr()
  const [{ data: project }, { data: cards }, { data: edges }] = await Promise.all([
    sb.from('projects').select('*').eq('id', params.id).single(),
    sb.from('cards').select('*').eq('project_id', params.id),
    sb.from('edges').select('*').eq('project_id', params.id),
  ])
  // Render CanvasShell com project, cards e edges
}
```

### 8.2 Criar card a partir do checklist (client)
```ts
await sb.from('cards').insert({
  project_id: projectId,
  stage_key: 'escopo',
  type_key: 'scope.features',
  title: 'Funcionalidades',
  status: 'DRAFT', x: 40, y: 60, w: 360, h: 280,
})
```

### 8.3 Gerar/Expandir/Review (Route Handler → IA)
```ts
// app/api/cards/[id]/generate/route.ts
export async function POST(req:Request,{ params }:{ params:{ id:string }}){
  const { mode } = await req.json()
  const ctx = await ContextService.build(projectId) // ideia base + cards READY resumidos
  const fields = await AIGenerationService.generate({ cardId: params.id, mode, ctx })
  // opcional: validar schema aqui
  return Response.json({ fields })
}
```

### 8.4 Confirmar card (optimistic concurrency)
```ts
// Atualizar com guarda de versão
const { data, error } = await sb.from('cards')
  .update({ fields, status: 'READY', version: prevVersion + 1 })
  .eq('id', cardId)
  .eq('version', prevVersion) // evita sobrescrever mudanças concorrentes
  .select().single()
```

### 8.5 Salvar GraphJSON (debounce ~800ms)
```ts
await sb.from('projects').update({ graph }).eq('id', projectId)
```

### 8.6 ContextService (server)
```ts
// Contexto inclui ideia base + resumos de cards READY
const { data: ready } = await sb
  .from('cards')
  .select('id,type_key,summary,fields')
  .eq('project_id', projectId)
  .eq('status', 'READY')
```

### 8.7 OutputService (gate + compor)
```ts
const { count: readyCount } = await sb.from('cards').select('*',{count:'exact',head:true}).eq('project_id',projectId).eq('status','READY')
if (type==='work-plan' && (readyCount??0)<2) throw new Error('LOCKED')
// compor markdown a partir dos cards READY
```

---

## 9) Segurança
- **Clerk** gerencia sessão; **Supabase RLS** assegura que somente o dono (claim `sub`) vê/edita seus registros.
- **Service‑role** apenas para rotinas administrativas (não no fluxo do app).
- **Rate limiting** em endpoints de IA/outputs.

---

## 10) Performance
- **Canvas**: virtualização de nós (cards) quando > 60 na viewport.
- **Autosave**: debounce 800ms; **IA** p95 ≤ 6s por geração.
- **Contexto**: resumir cards (≤1200 chars) e cachear por projeto (invalidar ao confirmar card).

---

## 11) Acessibilidade
- Navegação por teclado em cards e toolbar.
- Alternativa a drag‑n‑drop por menus (conectar/editar).
- Foco visível; contraste AA; leitores anunciam `Draft/Ready`.

---

## 12) Atalhos de Teclado (MVP)
- **⌘+S**: forçar salvar
- **⌘+Z / ⇧⌘+Z**: undo/redo
- **N**: novo card (abre seletor de etapa)
- **/**: foco no chat
- **G**: abrir **ProgressDrawer**

---

## 13) Telemetria
Eventos: `canvas_view`, `idea_base_created`, `checklist_click_stage`, `card_generated(mode)`, `card_confirmed`, `card_review_flag`, `workplan_enabled`, `output_generated(type)`, `ai_error`, `graph_saved`.

---

## 14) Erros & Empty States
- **Falha IA**: manter conteúdo atual e exibir opções de retry/ajuste de prompt.
- **Projeto sem cards**: CTA “Gerar cards iniciais”.
- **Conflito de versão**: aviso “Este card foi atualizado em outra aba. Recarregue para mesclar.”

---

## 15) Testes
- **E2E**: Onboarding → Ideia Base → checklist → gerar/confirmar 2 cards → Work Plan → PRD/Prompt Pack.
- **Integração**: ContextService monta contexto correto; OutputService respeita gate; RLS válida.
- **Unit**: validação de `fields` por schema; diffs aplicados corretamente; guards de versão.

---

## 16) Definition of Done (DoD)
- Fluxos principais funcionando (gerar/confirmar cards, gate, outputs).
- Canvas fluido (≥100 nós), IA p95 ≤ 6s.
- A11y AA, atalhos de teclado básicos.
- Telemetria ativa; RLS validada.
- E2E/integração/unidade passando.

---

## 17) Checklist de Implementação
- [ ] Server Component `/projects/:id` (SSR) carregando project/cards/edges
- [ ] **IdeaBaseCard** + **StageChecklist**
- [ ] Card types MVP: `scope.features`, `tech.stack` (S1); `design.concept`, `design.flow`, `scope.requirements`, `plan.release` (S2)
- [ ] **AIPanel** (Generate/Expand/Review + Diff)
- [ ] **OutputService** + **OutputsModal** (Work Plan gate)
- [ ] **ContextService** com resumo e cache
- [ ] **GraphJSON** snapshot + autosave debounce
- [ ] Telemetria, A11y e testes (E2E/integração/unit)

---

## 18) Futuro (fora do MVP)
- Colaboração em tempo real (presence, cursors, locks por card).
- Versionamento avançado e auditoria completa.
- Editor visual de arquitetura técnica.
- Exportações adicionais (diagrama,