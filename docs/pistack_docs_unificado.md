

# 📄 Documento: canvas_spec_completo_projects_id_visual_funcional_tecnico_v_1.md

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

---


# 📄 Documento: component_inventory_app_idea_stack_v_1.md

# Component Inventory — App Idea Stack — v1

> Inventário único de **componentes** da aplicação (UI/UX), organizado por **fundação**, **páginas** e **domínios** (Canvas, Cards, Outputs). Inclui tags **[MVP]** e **[Futuro]** e **props essenciais** dos principais componentes.

---

## 0) Convenções
- **Nomenclatura:** *PascalCase* para componentes; *camelCase* para props; sufixos `Card`, `Modal`, `Panel`, `Drawer`, `List`, `Item`.
- **Linguagem:** React + Next.js (App Router), Tailwind, shadcn/ui, lucide-react.
- **Acessibilidade:** todos componentes interativos com foco visível, `aria-*` adequado e tamanho ≥ 44px.

---

## 1) Fundação (Base UI)
- **Button** [MVP] — primário/secundário/ghost, estados loading/disabled.
- **IconButton** [MVP]
- **Input** [MVP] — text/email/number; com prefix/suffix.
- **Textarea** [MVP]
- **Select** [MVP]
- **Combobox** [MVP]
- **MultiSelect** [Futuro]
- **Checkbox** [MVP]
- **Switch** [MVP]
- **RadioGroup** [Futuro]
- **Slider** [Futuro]
- **Tabs** [MVP]
- **Badge** [MVP]
- **Chip/Tag** [MVP]
- **Tooltip** [MVP]
- **Popover** [MVP]
- **DropdownMenu** [MVP]
- **Table** [MVP]
- **KPIStat** [Futuro]
- **MarkdownViewer/Editor** [MVP]
- **CodeBlock (copy)** [MVP]
- **Skeleton** [MVP]
- **EmptyState** [MVP]
- **Toast**/**ToastRoot** [MVP]

### Layout
- **AppLayout** [MVP] — estrutura geral.
- **AuthLayout** [MVP] — wrapper de /auth.
- **TopBar** [MVP]
- **SideBarQuickActions** [Futuro]
- **RightPanel** [MVP] — inspector/AIPanel.
- **ModalRoot** [MVP]
- **DrawerRoot** [MVP]
- **ErrorBoundary** [MVP]
- **SaveIndicator** [MVP]
- **KeyboardShortcutsHelp** [MVP]

---

## 2) Autenticação (Clerk)
- **SignIn** (Clerk) [MVP]
- **SignUp** (Clerk) [MVP]
- **AuthCard** [MVP] — moldura visual quando usado em /auth com tabs.
- **AuthTabs** [Futuro] — alternância Login/Registrar.
- **AuthFooterLinks** [MVP] — Termos/Privacidade/Suporte.
- **AuthSkeleton** [MVP]

---

## 3) Página: /projects (Lista de Projetos)
- **ProjectsPage** [MVP]
  - **ProjectsHeader** [MVP]
    - **PageTitle** [MVP]
    - **NewProjectButton** [MVP]
    - **TemplatePickerInline** [Futuro]
  - **ProjectFilters** [MVP]
    - **SearchInput** [MVP]
    - **SortDropdown** [MVP]
    - **StatusFilter** [MVP]
  - **ProjectGrid** [MVP]
    - **ProjectTile** [MVP]
      - **ProjectTileMeta** [MVP]
      - **ProjectTileMenu** [MVP]
    - **ProjectTileSkeleton** [MVP]
  - **EmptyStateCreateFirstProject** [MVP]
  - **Pagination** [MVP]
- **NewProjectModal** [MVP]
- **ConfirmArchiveDialog** [MVP]
- **BulkActionsBar** [Futuro]
- **ImportExportMenu** [Futuro]

---

## 4) Página: /projects/:id (Canvas do Projeto)
- **CanvasPage** [MVP]
  - **CanvasShell** [MVP]
    - **CanvasToolbar** [MVP] — ZoomIn/ZoomOut, Fit, GridToggle, SnapToggle.
    - **CanvasViewport** [MVP]
    - **MiniMap** [Futuro]
    - **Ruler** [Futuro]
  - **Card** (wrapper) [MVP]
    - **CardHeader** [MVP]
    - **CardBody** [MVP]
    - **CardFooter** [MVP]
  - **AIPanel** [MVP]
    - **AIModeSwitcher** [MVP]
    - **PromptPreview** [MVP]
    - **DiffViewer** [MVP]
    - **ApplyChangesButton** [MVP]
  - **ProgressDrawer** [MVP]
  - **OutputsModal** [MVP] — PRD | Prompt Pack | Work Plan.
  - **ChatToggle** [Futuro]
  - **ChatThread** [Futuro]
  - **ChatInput** [Futuro]
  - **VersionHistoryPanel** [Futuro]
  - **OnboardingModal** [MVP]
  - **ConnectionOverlay** [Futuro]
  - **CanvasSkeleton** [MVP]

### 4.1 Cards por Etapa (Template “Site/App”)
**Ideia Base**
- **IdeaBaseCard** [MVP]
  - **IdeaFields** [MVP] — Nome, Pitch, Problema, Público, Valor, KPIs, Riscos.
  - **StageChecklist** [MVP] — itens clicáveis para criar cards.
  - **WorkPlanButton** [MVP] — gate ≥ 2 READY.

**Entendimento**
- **UnderstandingDiscoveryCard** [S2]
- **UnderstandingValuePropCard** [S2]

**Escopo**
- **ScopeFeaturesCard** [S1]
  - **FeatureSuggestionList** [S1]
  - **FeatureSelectionChips** [S1]
  - **FeatureDependenciesEditor** [S2]
- **ScopeRequirementsCard** [S2]
  - **FunctionalReqList** [S2]
  - **NonFunctionalReqList** [S2]
  - **AcceptanceCriteriaList** [S2]

**Design**
- **DesignConceptCard** [S2]
- **DesignFlowCard** [S2]
  - **ScreensList** [S2]
  - **CTAsList** [S2]
  - **EmptyStatesList** [S2]
  - **SuccessErrorEventsList** [S2]

**Tecnologia**
- **TechStackCard** [S1]
  - **FrontendStackPicker** [S1]
  - **BackendStackPicker** [S1]
  - **DBPicker** [S1]
  - **IntegrationList** [S1]
  - **TechRisksList** [S1]
- **TechArchCard** [S2]
  - **LayersDiagramStub** [Futuro]
  - **APIsContractList** [S2]
  - **ModulesOutline** [S2]

**Planejamento**
- **PlanReleaseCard** [S2]
  - **MVPGoalsList** [S2]
  - **LaunchCriteriaList** [S2]
  - **SuccessMetricsList** [S2]
  - **RisksList** [S2]
- **PlanRoadmapCard** [S2]
  - **MilestonesTimeline** [S2]
  - **SprintBuckets** [S2]
  - **DependenciesMap** [Futuro]

---

## 5) Outputs & Visualizadores
- **OutputsModal** [MVP] — tabs: PRD | Prompt Pack | Work Plan, com **MarkdownViewer**, **CopyOutputButton**, **DownloadOutputButton**, **RegenerateOutputButton**.
- **OutputPage** [Futuro] — visualização dedicada (`/outputs/:id`).
  - **OutputHeader** [Futuro]
  - **OutputFormatSwitcher** [Futuro]
  - **OutputContentViewer** [Futuro]
  - **OutputSkeleton** [Futuro]

---

## 6) Estados Vazios & Skeletons
- **AuthSkeleton** [MVP]
- **ProjectTileSkeleton** [MVP]
- **CanvasSkeleton** [MVP]
- **EmptyStateCreateFirstProject** [MVP]
- **EmptyStateNoCards** [MVP]
- **AIPanelSkeleton** [Futuro]

---

## 7) Ícones e Media
- **Icon** (lucide-react) [MVP] — sizes 16/18/20/24.
- **Illustration** [Futuro] — empty states.

---

## 8) Componentes de Sistema (auxiliares)
- **ConfirmationDialog** [MVP]
- **LoadingSpinner** [MVP]
- **Breadcrumbs** [Futuro]
- **ProgressBar** [Futuro]

---

## 9) Hooks utilitários (não-UI, referência)
- **useAuth() / useUser()** (Clerk) [MVP]
- **useProjects()** [MVP]
- **useCards()** [MVP]
- **useTemplate()** [MVP]
- **useOutputs()** [MVP]
- **useAI()** [MVP]
- **useContextSummary()** [MVP]
- **useDebouncedAutosave()** [MVP]
- **useKeyboardShortcuts()** [MVP]
- **useConnections()** [Futuro]
- **useProgress()** [MVP]
- **useToasts()** [MVP]

> Incluídos aqui apenas para **completude** do inventário; não são componentes visuais.

---

## 10) Props Essenciais — Principais Componentes

### 10.1 `ProjectTile`
```ts
interface ProjectTileProps {
  id: string;
  name: string;
  status: 'draft'|'active'|'archived';
  updatedAt: string | Date;
  onOpen: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
}
```

### 10.2 `IdeaBaseCard`
```ts
interface IdeaBaseCardProps {
  cardId: string;
  fields: {
    name?: string; pitch?: string; problem?: string; audience?: string;
    valueProp?: string; kpis?: string[]; risks?: string[];
  };
  checklist: Array<{ id:string; label:string; targetStageKey:string; targetTypeKey:string; done:boolean }>;
  workPlanEnabled: boolean; // gate ≥ 2 READY
  onChecklistClick: (target:{stageKey:string; typeKey:string}) => void;
  onChange: (patch: Partial<IdeaBaseCardProps['fields']>) => void;
  onConfirm?: () => void; // tornar READY (se aplicável)
}
```

### 10.3 `ScopeFeaturesCard`
```ts
interface ScopeFeaturesCardProps {
  cardId: string;
  suggestions: Array<{ id:string; title:string; rationale?:string; moscow:'must'|'should'|'could'|'wont'; dependsOn?:string[] }>;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onGenerate: () => void; // IA Generate
  onExpand: () => void;   // IA Expand
  onReview: () => void;   // IA Review
  onConfirm: () => void;  // marcar READY
}
```

### 10.4 `TechStackCard`
```ts
interface TechStackCardProps {
  cardId: string;
  frontend?: { framework?:string; pros?:string[]; cons?:string[] };
  backend?:  { language?:string; framework?:string; pros?:string[]; cons?:string[] };
  db?:       { type?:string; engine?:string };
  integrations?: string[];
  risks?: string[];
  onChange: (patch: Partial<TechStackCardProps>) => void;
  onConfirm: () => void;
}
```

### 10.5 `AIPanel`
```ts
interface AIPanelProps {
  mode: 'Generate'|'Expand'|'Review';
  loading?: boolean;
  diff?: { before?: any; after?: any };
  onModeChange: (m: AIPanelProps['mode']) => void;
  onApply: () => void;
  onClose?: () => void;
}
```

### 10.6 `OutputsModal`
```ts
interface OutputsModalProps {
  open: boolean;
  activeTab: 'prd'|'prompt-pack'|'work-plan';
  workPlanLocked?: boolean; // gate (<2 READY)
  content: { prd?: string; promptPack?: string; workPlan?: string };
  onTabChange: (tab: OutputsModalProps['activeTab']) => void;
  onCopy: (tab: OutputsModalProps['activeTab']) => void;
  onDownload: (tab: OutputsModalProps['activeTab']) => void;
  onRegenerate?: (tab: OutputsModalProps['activeTab']) => void;
  onOpenChange: (open: boolean) => void;
}
```

### 10.7 `CanvasToolbar`
```ts
interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  gridEnabled: boolean;
  onToggleGrid: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
}
```

### 10.8 `Card` (wrapper)
```ts
interface CardProps {
  id: string;
  stageKey: string; // "ideia-base" | "escopo" ...
  typeKey: string;  // "scope.features" ...
  title: string;
  status: 'DRAFT'|'READY';
  x: number; y: number; w: number; h: number;
  children: React.ReactNode; // conteúdo específico do card-type
  onMove?: (pos:{x:number;y:number}) => void;
  onResize?: (size:{w:number;h:number}) => void;
  onTitleChange?: (title: string) => void;
  onMenuAction?: (action: 'duplicate'|'delete'|'link');
}
```

---

## 11) Cobertura por Sprint (rastro)
- **S1 (MVP nuclear):** Button, Input, ModalRoot, ToastRoot; ProjectsPage + NewProjectModal + ProjectTile; CanvasShell + Card + IdeaBaseCard + ScopeFeaturesCard + TechStackCard; AIPanel; OutputsModal (Work Plan); ProgressDrawer; SaveIndicator; Skeletons.
- **S2:** ScopeRequirementsCard, DesignConceptCard, DesignFlowCard, PlanReleaseCard; menus avançados; ChatThread; VersionHistoryPanel.

---

## 12) Observações Finais
- Este inventário deve evoluir a cada novo **card-type** e **template**.
- Manter um **CHANGELOG** de componentes (adições/renomeações/remoções).
- Preferir compor novos componentes a partir da **Fundação** para consistência visual/funcional.



---


# 📄 Documento: guia_visual_pistack.md

# Guia Visual — PIStack / App Idea Stack — v1

> Referência de design para o MVP (Template “Site/App”), cobrindo princípios, tokens, componentes, padrões de interação e acessibilidade. Estilo: **neutro/escuro**, uso de cor **somente para ação/estado** e **identidade por etapa** discreta.

---

## 1) Princípios
1. **Canvas em foco:** cromia neutra e baixo ruído visual; cor apenas quando agrega significado.
2. **Claridade primeiro:** hierarquia tipográfica, espaçamentos generosos, microcopy concisa.
3. **Consistência modular:** mesma anatomia de card; variação apenas no **Body** por etapa.
4. **Leveza e fluidez:** bordas arredondadas, sombras suaves, animações sutis (Framer Motion).
5. **Acessível por padrão:** contraste AA, foco visível, área útil ≥ 44px.

---

## 2) Paleta

### 2.1 Neutros (Dark)
- **bg** `#0F1115` (fundo)
- **bg-elev** `#151821` (containers)
- **stroke** `#242837` (linhas, divisores)
- **text** `#E6E9F2` (texto principal)
- **text-dim** `#B9BECD` (suporte)

### 2.2 Semânticas
- **primary** `#7AA2FF` (ação/seleção)
- **success** `#5AD19A` (positivo/MVP OK)
- **warning** `#FFC24B` (atenção)
- **danger** `#FF6B6B` (erro)
- **info** `#9AA7FF` (destaques informativos)
- **cyan** `#8AD3FF` (tech/acento claro)
- **rose** `#FF8FA3` (planejamento/acento discreto)

### 2.3 Cores por Etapa (acento sutil)
- **Ideia Base:** `primary`  
- **Entendimento:** `info`  
- **Escopo:** `success`  
- **Design:** `warning`  
- **Tecnologia:** `cyan`  
- **Planejamento:** `rose`

> Uso recomendado: ícone do card, borda esquerda 2–3px, chips/badges e micro-acentos (nunca fundo total).

---

## 3) Tokens (CSS)
```css
:root{
  /* Neutros */
  --bg:#0F1115; --bg-elev:#151821; --stroke:#242837; --muted:#8A90A6;
  --text:#E6E9F2; --text-dim:#B9BECD;
  /* Semânticas */
  --primary:#7AA2FF; --success:#5AD19A; --warning:#FFC24B; --danger:#FF6B6B; --info:#9AA7FF; --cyan:#8AD3FF; --rose:#FF8FA3;
  /* Etapas */
  --accent-idea: var(--primary);
  --accent-understanding: var(--info);
  --accent-scope: var(--success);
  --accent-design: var(--warning);
  --accent-tech: var(--cyan);
  --accent-plan: var(--rose);
  /* Raio & Sombras */
  --radius-xl:16px; --radius-lg:12px; --radius-md:10px; --radius-sm:8px;
  --shadow-1:0 4px 16px rgba(0,0,0,.24);
  /* Espaços */
  --s-1:8px; --s-2:12px; --s-3:16px; --s-4:20px; --s-5:24px; --s-6:32px;
  /* Bordas */
  --border:1px solid var(--stroke);
}
```

---

## 4) Tipografia
- **Família:** Inter, system-ui; pesos 400 / 500 / 600.
- **Tamanhos:** H1 28–32, H2 22–24, H3 18–20, Body 14–16, Caption 12–13.
- **Regras:** no máximo duas hierarquias por card; não usar ALL CAPS para textos longos; manter line-height 1.4–1.6.

---

## 5) Grid & Layout
- **Contêiner principal:** 1200–1440px de largura útil no desktop.
- **Canvas:** zona central de pan/zoom; Sidebar direita retrátil 320–360px.
- **Gutters:** 16–24px; cards com padding interno 16px.
- **Responsivo:** stacks verticais em < 1024px; toolbar compacta.

---

## 6) Ícones
- **Biblioteca:** lucide-react.
- **Tamanhos:** 16 / 18 / 20 / 24px (padrão 18px em botões e headers de card).
- **Cores:** texto (neutro) por padrão; acento da etapa em ícones de card.

---

## 7) Elevação & Bordas
- **Cards/Modais:** `background: var(--bg-elev)`, `border: var(--border)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-1)`.
- **Bordas de Etapa (card):** barra esquerda 2–3px com `--accent-*` correspondente.

---

## 8) Motion (Framer Motion)
- **Entradas:** fade + translateY(8) 120ms.
- **Hover:** scale 1.01 em cards/botões discretamente.
- **Painel de IA:** slide da direita 160ms, com spring leve.
- **Restrições:** no more de 200ms para ações frequentes; reduzir para usuários com *prefers-reduced-motion*.

---

## 9) Estados & Feedback
- **Hover:** leve elevação + borda `#2B3042`.
- **Focus:** outline 2px `var(--primary)` com offset; itens clicáveis devem ter estado focus-vísivel.
- **Disabled:** opacidade .5 + pointer-events none.
- **Loading:** spinners discretos; botões com rótulo “Gerando…”
- **Toasts:** canto inferior direito; 3s; cores semânticas.

---

## 10) Componentes (GUIA DE ESTILO)

### 10.1 Botões
- **Primário:** fundo `--primary`, texto `#0B1022`; hover: escurecer 6%; foco: outline 2px.
- **Secundário:** fundo `--bg-elev`, borda `--stroke`, texto `--text`.
- **Tônico de Etapa:** ícone + badge com `--accent-*` (não usar como fundo cheio).

### 10.2 Inputs & Forms
- Campo com `--bg-elev`, borda `--stroke`, radius `--radius-md`.
- Focus: borda `--primary`, glow sutil.
- Help text em `--text-dim`.

### 10.3 Tabs / Segmented
- Barra inferior ativa `--primary`; labels 14–16.

### 10.4 Chips/Tags
- **Padrão:** contorno `--stroke`, texto `--text-dim`.
- **MoSCoW (Escopo):**  
  - Must: contorno `--primary`, preenchido leve `rgba(122,162,255,.12)`
  - Should: contorno `--info`
  - Could: contorno `--text-dim`
  - Won’t: contorno `--danger`, texto `#FF9B9B`

### 10.5 Badges de Status
- **DRAFT:** cinza (`--text-dim`), contorno `--stroke`.
- **READY:** `--success` (contorno + texto).

### 10.6 Cards (Anatomia)
- **Header:** ícone etapa (colorido), título (H3), **StatusBadge**, menu (…)
- **Body:** campos do schema (listas, chips, textarea).
- **Footer:** timestamps, links, AITrace.
- **Borda esquerda:** 2–3px `--accent-*` por etapa.

### 10.7 AIPanel
- Dockável; largura 360–420px.
- **AIModeSwitcher:** três estados (Generate/Expand/Review).
- **PromptPreview:** monoespaçada 12–13px.
- **DiffViewer:** added/removed em tons de `--success`/`--danger` **muito** sutis.

### 10.8 StageChecklist (Ideia Base)
- Itens com ícone + label; `done` apenas quando card vira READY.
- Ao hover, mostrar dica “Criar card da etapa”.

### 10.9 ProgressDrawer
- Barras por etapa; % = cards READY / total da etapa.

### 10.10 Outputs Modal
- Cabeçalho com Tabs (PRD | Prompt Pack | Work Plan).
- Viewer markdown com **Copy** e **Download**.

### 10.11 Chat Contextual
- Bolhas com `--bg-elev`; avatar do sistema (ícone lightning) em `--primary`.

### 10.12 Skeletons
- **Card Skeleton:** blocos 12–16px; linhas 60–120px; shimmer suave.
- **Projects Grid:** 6–12 tiles ghost.

---

## 11) Padrões por Página

### /auth (Clerk)
- Wrapper escuro; `<SignIn/> / <SignUp/>` com `appearance` custom (radius 16, cores neutras, botão primário `--primary`).
- Link entre abas/rotas com microcopy objetiva.

### /projects
- Título + botão “Novo projeto”.
- Grid de tiles 3–4 colunas (≥1280px); 2 colunas (≥1024px).
- Tile: nome (16px/600), meta (12px), menu.

### /projects/:id (Canvas)
- Toolbar topo (Zoom/Fit/Grid/Snap) com ícones de 18px.
- Right panel (AIPanel) recolhível.
- Cards com **borda de etapa** e densidade regular.

---

## 12) Data Viz (MVP)
- **Recharts**; sem estilos complexos.
- Cores: usar `--primary` e variações neutras; evitar arco-íris.
- Labels 12–13px; grid `#2B3042`.

---

## 13) Clerk — `appearance` (exemplo)
```ts
const appearance = {
  elements: {
    card: { backgroundColor: 'var(--bg-elev)', borderRadius: '16px', boxShadow: 'var(--shadow-1)', border: '1px solid var(--stroke)' },
    formFieldInput: { backgroundColor: 'var(--bg)', borderColor: 'var(--stroke)', color: 'var(--text)' },
    formButtonPrimary: { backgroundColor: 'var(--primary)', color: '#0B1022' },
    footer: { color: 'var(--text-dim)' },
  },
  layout: { socialButtonsPlacement: 'bottom', logoPlacement: 'inside' },
};
```

---

## 14) Acessibilidade Visual
- Contraste AA (mín. 4.5:1) para texto normal.
- Foco sempre visível (outline 2px primário).
- Área tocável ≥ 44px; distância mínima 8px entre alvos.
- Placeholder ≠ única pista; sempre label.

---

## 15) Biblioteca no Figma — Organização
- **01 Tokens** (cores, tipografia, efeitos, spacing)
- **02 Ícones** (Lucide selecionados)
- **03 Componentes Base** (Button, Input, Tabs, Chips, Badge)
- **04 Cards por Etapa** (variações com acento)
- **05 Padrões** (AIPanel, Checklist, Outputs Modal, Progress Drawer, Chat)
- **06 Páginas** (/auth, /projects, /canvas) — mockups responsivos

---

## 16) DoD Visual (MVP)
- Tokens implementados em CSS/Tailwind.
- Páginas com contraste e foco validados.
- Cards por etapa com acento correto.
- AIPanel, Checklist e Outputs Modal finalizados.
- Clerk com `appearance` alinhado ao guia.



---


# 📄 Documento: login_spec_completo.md

# Login — Spec Completo (Visual + Funcional + Técnico) — v1

> Documento único que consolida **UI/UX**, **comportamento**, **integração técnica** e **QA** da página de **Login** com **Clerk** e **Supabase (RLS)**. Abrange também o fluxo pós‑auth (**ProjectGate** em `/post-auth`).

---

## 1) Visão Geral
- **Objetivo:** permitir **entrar** rapidamente no produto com segurança e acessibilidade, mantendo a identidade visual.
- **Escopo:** `/sign-in` (Login). Opcional: `/auth` (tabs SignIn/SignUp) e `/sign-up` (Registro).
- **Pós‑auth:** `/post-auth` (SSR) executa **ProjectGate**.
- **Público:** makers (PM/UX/Dev) e solo makers.

### 1.1 Fora de escopo (Login)
- Gestão de conta/perfil, 2FA, recovery de e‑mail (mantidos pelo Clerk sem customizações no MVP).

---

## 2) User Stories
- **US‑L01** Como usuário, quero **entrar com e‑mail/senha** para acessar meus projetos.
- **US‑L02** Como novo usuário, quero **registrar** e ser levado direto para começar um projeto (via SignUp, caso exista `/auth`/`/sign-up`).
- **US‑L03** Como usuário, quero **mensagens claras de erro** e **feedback de loading** durante o login.

---

## 3) Fluxos

### 3.1 Login (existente)
1. Visitar `/sign-in`.
2. Preencher credenciais no **Clerk SignIn**.
3. Sucesso → redireciona para **`/post-auth`**.
4. **ProjectGate** consulta Supabase:
   - **Nenhum projeto**: cria projeto **draft** (template: `site-app`) → **`/projects/:id?onboarding=1`**.
   - **Há projetos**: **`/projects`**.

### 3.2 Registro (opcional no MVP da página de Login)
1. Visitar `/sign-up` ou aba “Registrar” em `/auth`.
2. Sucesso → **`/post-auth`** → ProjectGate como acima.

### 3.3 SignedOut em rota protegida
- Acessar `/projects` ou `/projects/:id` sem sessão → redirect do middleware para **`/sign-in`**.

### 3.4 Visitar `/sign-in` já autenticado
- Detectar sessão → redirect para **`/projects`** (ou `/post-auth`).

---

## 4) Padrões Visuais (resumo aplicado)
- **Tema:** escuro (dark);
- **Container:** 480–560px, centralizado (grid `place-items-center`), padding 24–48px;
- **Card:** bg `--bg-elev`, borda `--stroke`, radius 12px, sombra leve;
- **Tipografia:** H1 28–32/600, subtítulo 14–16/400 dim;
- **Botão primário:** `--primary` com texto `#0B1022`;
- **Estados:** hover/active sutis, focus com **outline 2px** primário;
- **A11y:** contraste AA, alvos ≥44px, `aria-live` para erros.

> Tokens/cores: ver **Guia Visual**.

---

## 5) Microcopy (PT‑BR)
- **Título:** “Bem‑vindo de volta”
- **Subtítulo:** “Acesse seus projetos e continue de onde parou.”
- **Botão:** “Entrar”
- **Link registro:** “Criar conta”
- **Erro:** “Credenciais inválidas. Verifique seu e‑mail e senha.”
- **Rodapé:** “Ao continuar, você concorda com nossos Termos e Política de Privacidade.”

---

## 6) Integração técnica — Clerk

### 6.1 Dependências & Env
- `@clerk/nextjs`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### 6.2 Provider (App Router)
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-br"><body>{children}</body></html>
    </ClerkProvider>
  )
}
```

### 6.3 Middleware
```ts
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  publicRoutes: ['/','/auth(.*)?','/sign-in(.*)?','/sign-up(.*)?','/api/webhooks/clerk']
})
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
```

### 6.4 Página `/sign-in`
```tsx
// app/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs'
import { signInAppearance } from '@/styles/clerk-appearance'

export default function SignInPage(){
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-[520px] space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-[28px] font-semibold text-[var(--text)]">Bem‑vindo de volta</h1>
          <p className="text-[14px] text-[var(--text-dim)]">Acesse seus projetos e continue de onde parou.</p>
        </div>
        <SignIn routing="path" afterSignInUrl="/post-auth" appearance={signInAppearance} />
        <p className="text-center text-[12px] text-[var(--text-dim)]">Ao continuar, você concorda com nossos Termos e Política de Privacidade.</p>
      </div>
    </main>
  )
}
```

### 6.5 Aparência do Clerk (dark)
```ts
// styles/clerk-appearance.ts
export const signInAppearance = {
  variables: { colorPrimary: 'var(--primary)' },
  elements: {
    rootBox: { display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: 'var(--bg-elev)', border: '1px solid var(--stroke)', borderRadius: '12px', boxShadow: 'var(--shadow-1)' },
    headerTitle: { color: 'var(--text)' },
    headerSubtitle: { color: 'var(--text-dim)' },
    formFieldLabel: { color: 'var(--text)' },
    formFieldInput: { backgroundColor: 'var(--bg)', borderColor: 'var(--stroke)', color: 'var(--text)' },
    formFieldInput__error: { borderColor: 'var(--danger)' },
    formButtonPrimary: { backgroundColor: 'var(--primary)', color: '#0B1022' },
    footer: { color: 'var(--text-dim)' }
  }
} as const
```

### 6.6 Redirecionamento pós‑auth
- Configurar `<SignIn afterSignInUrl="/post-auth" />` (e `<SignUp afterSignUpUrl="/post-auth" />` se aplicável).

---

## 7) Integração técnica — Supabase (RLS) no ProjectGate

### 7.1 Helper SSR com token do Clerk
```ts
// lib/supabase-ssr.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function supabaseSsr(){
  const { getToken } = auth()
  const token = await getToken({ template: 'supabase' })
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: { fetch: (url, opts:any={}) => {
      const headers = new Headers(opts.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url, { ...opts, headers })
    }}
  })
}
```

### 7.2 `/post-auth` (SSR ProjectGate)
```tsx
// app/post-auth/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabaseSsr } from '@/lib/supabase-ssr'

export default async function PostAuthGate(){
  const { userId } = auth();
  if (!userId) redirect('/sign-in')
  const supabase = await supabaseSsr()

  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) === 0) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: 'Untitled Project', template_id: 'site-app', status: 'draft' })
      .select()
      .single()
    if (error) redirect('/projects')
    return redirect(`/projects/${data.id}?onboarding=1`)
  }
  return redirect('/projects')
}
```

> **RLS** garante que o usuário só conte/crie nos próprios projetos (policies configuradas no schema Supabase).

---

## 8) Estados & Acessibilidade
- **Loading:** spinner no botão; inputs desabilitados.
- **Erro:** banner com `aria-live="assertive"`; foco programático no título do erro.
- **Keyboard:** Tab order lógico; Enter envia; Esc fecha modais (se houver).
- **Responsivo:** stacking < 768px; evitar overflows horizontais; tocar alvos ≥44px.

---

## 9) Segurança
- **Sessão/CSRF/cookies:** delegados ao Clerk (cookies `HttpOnly`, `Secure`).
- **RLS:** policies garantem que somente o dono (claim `sub`) veja/modele seus registros.
- **Rate limit:** proteger `/post-auth` e rotas de IA/outputs (middleware/API) — não aplicável diretamente ao SignIn (Clerk já limita).
- **Dados sensíveis:** nenhum campo de senha na nossa DB; evitar logs de tokens.

---

## 10) Telemetria
- **Eventos:** `login_view`, `clerk_sign_in_success`, `clerk_sign_in_error`, `post_auth_gate_create_draft`, `post_auth_gate_to_projects`.
- **Atributos:** `provider` (email, oauth), `latency_ms`, `error_code`.

---

## 11) Testes
- **E2E:** `/sign-in → /post-auth → /projects` (com e sem projetos); redirecionar SignedOut de rota protegida.
- **Visual:** contraste AA, foco visível, estados (idle/loading/erro).
- **Integração:** ProjectGate cria projeto com token do usuário (sem service‑role); RLS funciona.
- **A11y:** navegação por teclado, leitores de tela anunciam erros.

---

## 12) Performance
- **Orçamento:** TTI < 2.5s em rede 3G rápida; CLS ~0; carregamento do widget do Clerk sem bloqueio (lazy/layout shift mínimo).
- **Assets:** evitar imagens pesadas; usar fontes do sistema.

---

## 13) Erros & Mensagens (mapa)
- `INVALID_CREDENTIALS` (Clerk) → “Credenciais inválidas…”
- `USER_LOCKED` (Clerk) → “Muitas tentativas. Tente mais tarde.”
- `NETWORK_ERROR` → “Sem conexão. Verifique sua internet.”
- `/post-auth` falhou criar projeto → seguir para `/projects` e exibir toast “Não foi possível iniciar o projeto automaticamente.”

---

## 14) I18N
- Preparar strings do título, subtítulo e rodapé para i18n (PT‑BR → EN futuramente). Clerk já possui i18n no widget.

---

## 15) Definition of Done (DoD)
- Página **acessível** (AA), responsiva e com **appearance** aplicado.
- Login funcional (Clerk) com redirect para `/post-auth`.
- **ProjectGate** operacional: cria draft quando necessário.
- Telemetria ativa e test cases E2E/integração passando.

---

## 16) Checklist de Implementação
- [ ] Instalar Clerk e configurar Provider/Middleware
- [ ] Criar `/sign-in` com `SignIn` + `appearance`
- [ ] Implementar `/post-auth` (ProjectGate) com Supabase RLS
- [ ] Configurar policies no Supabase (projects/cards)
- [ ] Telemetria + A11y QA + testes E2E

---

## 17) Riscos & Mitigações
- **Indisponibilidade do Clerk** → mensagem de status + link de tentativa novamente.
- **Falha Supabase no `/post-auth`** → fallback para `/projects` + toast informativo.
- **RLS mal configurada** → testes de policies; revisão SQL em PR.


---


# 📄 Documento: prd-global-pistack.md

# PRD — Global do Produto (PIStack / App Idea Stack) — v2.1

> Este PRD consolida objetivos, escopo, requisitos e critérios do **MVP** com **Template “Site/App”**, **Clerk** para autenticação e **Canvas de cards inteligentes**.

---

## 1) Contexto e Problema
Makers e times pequenos perdem tempo transformando ideias em planos acionáveis. Ferramentas atuais exigem múltiplos artefatos dispersos (docs, boards, chats) sem coerência entre visão, escopo, design e tecnologia.

**Oportunidade:** unificar ideação → estruturação → outputs (PRD, Work Plan, Prompt Pack) num **canvas com IA** e **templates guiados por etapas**.

---

## 2) Objetivos (MVP)
1. Converter uma ideia em **plano de trabalho** inicial **em minutos**.
2. Garantir **coerência** entre escopo, design e tecnologia via **IA com contexto do projeto**.
3. Entregar **outputs prontos** (PRD, Prompt Pack, Work Plan) a partir de 2+ cards confirmados.

**Métricas de Sucesso:** ver KPIs (seção 10).

---

## 3) Público-Alvo
- Designers/PMs/Devs em squads pequenos.
- Solo makers que precisam de estrutura rápida com boa documentação.

---

## 4) Escopo do MVP
- **Template**: “**Quero criar um site / aplicativo**”.
- **Etapas/Stages**: Ideia Base (com **Checklist clicável**) → Entendimento → Escopo → Design → Tecnologia → Planejamento.
- **Cards por etapa** com **schemas** e **painel de IA** (Generate/Expand/Review).
- **Outputs**: **Work Plan** (gate ≥2 READY), **PRD**, **Prompt Pack**.
- **Auth**: **Clerk** (SignIn/SignUp), **/post-auth** roda ProjectGate.
- **Páginas**: `/sign-in|/sign-up` (ou `/auth`), `/projects`, `/projects/:id` (Canvas).

**Fora do MVP**: multi‑template (produto físico, evento…), colaboração realtime, editor visual de arquitetura, permissões avançadas.

---

## 5) Fluxos Principais
1) **Sign‑in/Sign‑up (Clerk)** → **/post-auth**  
2) **ProjectGate**: se não há projetos → cria **draft** e redireciona **Canvas** com onboarding; caso contrário → **/projects**.  
3) **Onboarding Canvas** → cria **Ideia Base** → **Checklist** cria cards.  
4) **IA** gera/expande/revisa **cards** com **ContextService** (Ideia Base + cards READY).  
5) **Confirmar** cards → status **READY**.  
6) **Outputs** liberados com **gate** (Work Plan ≥2 READY; PRD/Prompt Pack sem gate adicional).

---

## 6) Requisitos Funcionais
- **RF-01** Seleção de template + criação do card **Ideia Base** com **Checklist**.
- **RF-02** Card por etapa com **schema específico** (campos, listas, chips, etc.).
- **RF-03** **Painel de IA** por card (Generate/Expand/Review) usando contexto do projeto.
- **RF-04** Confirmação de card altera **`status=DRAFT→READY`** (validação por schema).
- **RF-05** **Work Plan** liberado quando **≥2 cards** estiverem **READY**.
- **RF-06** Geração de **PRD**, **Prompt Pack** e **Work Plan** em modal (copiar/baixar).
- **RF-07** **Autosave** com indicador de status.
- **RF-08** **Clerk Auth** (SignIn/SignUp) com **/post-auth** (ProjectGate).

---

## 7) Requisitos Não Funcionais
- **RNF-01** p95 de geração por card ≤ **6s**.
- **RNF-02** Canvas fluido com **≥100** nós renderizados.
- **RNF-03** Acessibilidade AA: foco visível, navegação por teclado nos cards.
- **RNF-04** Observabilidade: telemetria de eventos e AITrace (prompt, tokens, custo).
- **RNF-05** Segurança de sessão delegada ao **Clerk**.

---

## 8) Critérios de Aceitação
- **CA-01** Ideia Base com **Checklist** que cria cards corretos.
- **CA-02** IA pré‑preenche campos conforme **schema** do card.
- **CA-03** Confirmar card → `READY`; progresso refletido.
- **CA-04** Work Plan habilita somente com **≥2 READY**.
- **CA-05** Outputs geram conteúdo coerente com **Ideia Base + READY**.
- **CA-06** Fluxo Clerk: Sign‑in/Sign‑up → **/post-auth** → gate correto.

---

## 9) Dependências
- **Clerk** (auth, sessão, UI de Sign‑in/Sign‑up).
- **Infra IA** (LLM) via serviço server‑side.
- **DB** (projetos, cards, outputs, AITrace).

---

## 10) KPIs
- % usuários que alcançam **≥2 cards READY**.
- **Time‑to‑Output** (tempo até Work Plan/PRD).
- Uso por tipo de **Output**.
- Taxa de sucesso (Clerk) de sign‑in/sign‑up.

---

## 11) Riscos & Mitigações
- **Inconsistência entre cards** → modo **Review** (cross‑check) ao confirmar.
- **Falha IA** → fallback com templates manuais e mensagens claras.
- **Foco estreito de template** → expandir via releases incrementais.

---

## 12) Release Plan (2 sprints)
- **S1**: Ideia Base + Checklist; `scope.features`, `tech.stack`; Work Plan; Clerk integrado.
- **S2**: `design.concept`, `design.flow`, `scope.requirements`, `plan.release`; PRD + Prompt Pack.

---

## 13) Telemetria
`template_selected`, `idea_base_created`, `checklist_click_stage`, `card_generated(mode)`, `card_confirmed`, `workplan_enabled`, `output_generated(type)`, `clerk_sign_in_success`, `clerk_sign_up_success`.

---

## 14) Glossário
**Template**: conjunto de etapas; **Stage**: etapa lógica; **Card Type**: modelo de card por etapa; **Checklist**: itens acionáveis no Ideia Base; **READY**: card confirmado; **Output**: Work Plan, PRD, Prompt Pack; **ProjectGate**: lógica pós‑auth que cria draft ou leva à lista.



---


# 📄 Documento: prd-mvp-template-pistack.md

# PRD — Template “Quero criar um site / aplicativo” — v2.1

> PRD específico do **template MVP**. Define etapas, modelos de card, regras de IA e outputs.

---

## 1) Objetivo do Template
Guiar o usuário de **Ideia** → **Plano Executável** para sites/apps com coerência entre **Entendimento**, **Escopo**, **Design**, **Tecnologia** e **Planejamento**.

---

## 2) Etapas e Card Types
1) **Ideia Base** — `idea.base`
   - **Campos**: Nome, Pitch (1 linha), Problema, Público, Proposta de Valor, KPIs iniciais, Riscos.
   - **Checklist**: Entendimento → `understanding.discovery`; Escopo → `scope.features`; Design → `design.concept`; Tecnologia → `tech.stack`; Planejamento → `plan.release`.
   - **Ação**: **Work Plan** (desabilitado até ≥2 READY).

2) **Entendimento**
   - `understanding.discovery`: hipóteses, personas rápidas, dores, suposições críticas, perguntas de pesquisa.
   - `understanding.value-prop`: proposta detalhada, alternativas/concorrência, diferenciais.

3) **Escopo**
   - `scope.features`: **sugestões (MoSCoW)**, seleção de funcionalidades, dependências.
   - `scope.requirements`: requisitos funcionais e não‑funcionais + critérios de aceite.

4) **Design**
   - `design.concept`: princípios de UI, mood, heurísticas prioritárias.
   - `design.flow`: telas, objetivos, CTAs, estados vazios, eventos sucesso/erro; linka a features.

5) **Tecnologia**
   - `tech.stack`: front/back/DB/infra, integrações, riscos técnicos, prós/cons.
   - `tech.arch`: camadas, módulos, APIs/contratos de alto nível.

6) **Planejamento**
   - `plan.release`: objetivos do MVP, critérios de lançamento, métricas, riscos.
   - `plan.roadmap`: milestones, sprints, dependências.

---

## 3) Regras de IA (CIA — Context Informed AI)
- **Contexto**: Ideia Base + **resumo (≤1200 chars)** de cada card **READY**.
- **Modos**: **Generate**, **Expand**, **Review**.
- **Validação**: saída deve respeitar **schema** do card‑type; bloquear confirmação se inválida.
- **Cross‑links**: confirmar `scope.features` propaga sugestões para `design.flow` e `tech.stack`.

---

## 4) Outputs do Template
- **Work Plan** *(gate: ≥2 READY)*: backlog inicial (épicos/tarefas), dependências, milestones e riscos.
- **PRD**: visão → problema → objetivos → público → RF/RNF → fluxos/telas → stack/arquitetura → MVP → riscos → métricas.
- **Prompt Pack**: prompts por card‑type (com variáveis do projeto).

---

## 5) Critérios de Aceitação por Etapa
- **Ideia Base**: Checklist cria cards corretos; botão Work Plan aparece (desabilitado inicialmente).
- **Entendimento**: personas/hipóteses coerentes com a ideia.
- **Escopo**: funcionalidades rotuladas em MoSCoW; seleção persistida.
- **Design**: telas e CTAs coerentes com features.
- **Tecnologia**: stack compatível com features e riscos mapeados.
- **Planejamento**: MVP priorizado e critérios de lançamento definidos.

---

## 6) KPIs do Template
- Tempo até **1º card READY**.
- % de projetos que geram **Work Plan** (atingiram gate ≥2 READY).
- Taxa de geração de **PRD** e **Prompt Pack**.

---

## 7) Dependências
- **Clerk** (auth) → acesso ao Canvas e filtros por usuário.
- **LLM** (IA server‑side) → geração/expansão/revisão de cards.
- **DB** → projetos/cards/outputs/AITrace.

---

## 8) Riscos & Mitigações
- **Sugerir excesso de features** → limite de 12 e forçar MoSCoW.
- **Fluxos inconsistentes** → **Review** de coerência ao confirmar cards críticos.

---

## 9) Release Plan (MVP)
- **S1**: `idea.base`, `scope.features`, `tech.stack`, **Work Plan**.
- **S2**: `design.concept`, `design.flow`, `scope.requirements`, `plan.release`, **PRD** e **Prompt Pack**.

---

## 10) Glossário
**MoSCoW**: must/should/could/won’t; **READY**: card confirmado; **ContextService**: agregador de contexto; **Prompt Pack**: coleção de prompts por etapa.



---


# 📄 Documento: projects_list_spec_completo.md

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



---


# 📄 Documento: ideastack-fluxo-mvp.md

# 🧭 Fluxo do Usuário – MVP da Plataforma de Estruturação Colaborativa com IA  

## 1. Onboarding / Criação de Projeto  
- O usuário cria um **novo projeto**, definindo:  
  - **Nome do projeto**  
  - **Descrição inicial da ideia**  
- A plataforma oferece duas opções:  
  1. **Gerar ideias do zero** → a IA sugere possibilidades a partir de um tema.  
  2. **Aprimorar a ideia inicial** → a IA organiza, expande e detalha a descrição fornecida.  
- Resultado: a ideia gera o **primeiro card no canvas**.  

---

## 2. Canvas Inicial  
- O usuário é levado para o **canvas visual**.  
- A IA gera automaticamente cards iniciais sugeridos, como:  
  - Contexto  
  - Personas  
  - Funcionalidades  
  - Stack Técnica  
  - Backlog  
  - Roadmap  
- O usuário pode abrir, editar ou excluir esses cards.  

---

## 3. Chat Contextual por Card  
- Cada card tem um **chat específico com IA**, que mantém o contexto daquele tema.  
- Exemplos de interação:  
  - No card *Personas*: “Adicione uma persona jovem focada em esportes.”  
  - No card *Stack Técnica*: “Sugira alternativas ao Firebase para autenticação.”  
- A IA atualiza o card, mantendo histórico de versões.  

---

## 4. Evolução Modular  
- O usuário pode **criar novos cards** manualmente (ex: “Marketing”, “Pesquisa de Usuários”).  
- Cards podem ser **conectados** no canvas (ex: Funcionalidades → Backlog).  
- A IA sugere **expansões automáticas**, por exemplo:  
  - Criar histórias de backlog a partir de funcionalidades.  
  - Sugerir features a partir de personas.  

---

## 5. Plano de Trabalho Automático  
- O usuário aciona **“Gerar Plano”**.  
- A IA produz:  
  - **Roadmap com milestones**  
  - **Backlog dividido por papéis** (PM, Dev, UX, QA)  
  - **Cronograma base**  
- O plano pode ser **exportado** para Markdown, Notion, Trello ou Jira.  

---

## 6. Gerador de Prompts Inteligente  
- Cada card tem acesso a um **gerador de prompts prontos**, para apoiar:  
  - **Design** (wireframes, UI)  
  - **Desenvolvimento** (boilerplate, documentação)  
  - **Pesquisa** (entrevistas, questionários)  
- Prompts podem ser usados em outras ferramentas (Figma, Cursor, MidJourney, etc.).  

---

## 7. Exportação e Iteração Contínua  
- O usuário pode exportar o **plano completo** ou apenas alguns cards.  
- O projeto fica salvo no canvas, podendo ser refinado a qualquer momento.  
- Histórico de versões permite acompanhar a **evolução do projeto**.  

---

## 📌 Resumo Visual do Fluxo  
1. **Onboarding** → Nome + Ideia inicial  
2. **Canvas gerado** → Cards iniciais criados pela IA  
3. **Chat contextual por card** → Refinamento modular  
4. **Evolução** → Adicionar novos cards, conectar, expandir  
5. **Plano de Trabalho** → Roadmap + Backlog + Exportação  
6. **Prompts Inteligentes** → Design, Dev, Pesquisa  
7. **Iteração contínua** → Refinar cards e evoluir projeto  


---


# 📄 Documento: ideastack-prd.md

# 📌 PRD – Plataforma de Estruturação Colaborativa com IA  

## 1. Visão Geral  
O aplicativo é uma **plataforma de co-criação com IA** que ajuda usuários a transformar ideias em planos estruturados.  
Ele funciona em torno de um **canvas modular**, onde cada etapa (ideia, personas, funcionalidades, stack, backlog, roadmap) é representada por **cards** conectados entre si.  

Cada card é **alimentado e refinado por um chat contextual com IA**, garantindo evolução contínua e modular.  

---

## 2. Racional do Projeto  
O que estamos fazendo aqui neste processo de concepção **já é a proposta da aplicação em ação**:  
- O usuário traz uma **ideia inicial**.  
- A IA ajuda a **aprimorar essa ideia** e a expandi-la.  
- Cada resposta gera um **bloco estruturado** (ex: PRD, fluxo, funcionalidades).  
- O usuário refina cada bloco de forma **modular e contextual**.  

Hoje, isso acontece em formato **linear e textual** (como uma thread de conversa).  
A aplicação vai transformar esse fluxo em uma experiência:  
- **Visual (canvas com cards conectados).**  
- **Modular (cada card com chat próprio).**  
- **Iterativa e paralela (vários cards podem ser evoluídos ao mesmo tempo).**  

👉 O diferencial está em **organizar e dar persistência visual** a uma jornada que já acontece naturalmente em conversas e brainstorms.  

---

## 3. Objetivos  
- **Guiar a criação e evolução de projetos com IA** de forma clara e intuitiva.  
- **Gerar estrutura desde a ideação inicial** (brainstorm ou refinamento de uma ideia crua).  
- **Transformar elementos em cards conectados** no canvas.  
- **Permitir refinamento infinito** via chat contextual por card.  
- **Reduzir a distância entre ideias e execução** com outputs prontos (personas, backlog, prompts, roadmap).  

---

## 4. Público-Alvo  
- **Founders/Empreendedores** → validar ideias rapidamente.  
- **PMs/Squads** → estruturar backlog e roadmap.  
- **Designers/Devs autônomos** → organizar e planejar entregas.  
- **Estudantes/Makers** → aprender a estruturar projetos com IA.  

---

## 5. Funcionalidades Principais (MVP)  

### 🎯 Núcleo  
1. **Ideação inicial**  
   - Usuário pode **gerar novas ideias** com IA ou **aprimorar sua ideia inicial**.  
   - Cada ideia gera um **card no canvas**.  

2. **Canvas Modular**  
   - Blocos de: *Contexto, Personas, Funcionalidades, Stack Técnica, Backlog, Roadmap*.  
   - Cards conectados em visão visual/relacional.  

3. **Chat Contextual (requisito central)**  
   - Cada card tem um chat específico com IA.  
   - Permite refinamento contínuo (ex: “adicione uma persona mais jovem”, “crie uma versão do backlog só para mobile”).  
   - Histórico e contexto preservados por card.  

4. **Gerador de Prompts Inteligente**  
   - Para design, dev, pesquisa e planejamento.  
   - Associado a cada card.  

5. **Plano de Trabalho Automático**  
   - Linha do tempo com milestones.  
   - Atribuição por papéis (PM, Dev, UX, QA).  
   - Exportação em Markdown, Trello, Notion, Jira.  

---

## 6. Cenários de Aplicação  
A metodologia (ideia → personas → backlog → plano) pode ser aplicada em múltiplos contextos:  

1. **Criação de Produto Digital** (apps, SaaS, e-commerces).  
2. **Gestão de Squads/Projetos em andamento**.  
3. **Planejamento de Eventos** (agenda, público, logística).  
4. **Campanhas de Marketing** (objetivos → público → canais → cronograma).  
5. **Pesquisa e Desenvolvimento (P&D)** (hipóteses → experimentos → backlog).  
6. **Educação/Cursos** (trilhas de aprendizado → conteúdos → atividades).  
7. **Planejamento Pessoal/Carreira** (metas, backlog de atividades, cronograma).  
8. **Design de Serviços** (mapas de jornada, artefatos, melhorias).  

---

## 7. Funcionalidades Futuras (Roadmap)  
- Importação de arquivos (PDF, Docs, CSV) → IA processa e gera insights/cards.  
- Colaboração multiusuário (squad inteira no projeto).  
- Integrações: Jira, Notion, GitHub, Figma.  
- Templates de cenários prontos (app, squad, evento, curso, etc.).  
- Visualização de evolução (versões do canvas ao longo do tempo).  

---

## 8. Stack Técnica (proposta inicial)  

### 🌐 Frontend  
- **React + Next.js** → interface modular.  
- **TailwindCSS** → estilização rápida.  
- **React Flow / D3.js** → canvas modular.  

### ⚙️ Backend  
- **Node.js + NestJS** → API estruturada.  
- **Supabase ou Firebase** → autenticação e banco.  
- **Prisma ORM** → modelagem de dados.  

### 🤖 IA  
- **OpenAI GPT-5** → geração de conteúdo e prompts.  
- **LangChain / LlamaIndex** → orquestração de contexto e chats por card.  
- **Vector DB (Pinecone/Weaviate)** → memória por projeto e card.  

### ☁️ Infra  
- **Vercel** → frontend.  
- **Railway/Render** → backend.  
- **Supabase Storage / S3** → arquivos e assets.  

---

## 9. Entregáveis do MVP  
- 🎨 Canvas interativo com cards conectados.  
- 🤖 IA integrada em cada card com chat contextual.  
- 📋 Exportação do plano de trabalho (Markdown/Trello).  
- ⚡ Gerador de prompts inteligentes por card.  

---

## 10. Métricas de Sucesso  
- **Tempo médio para sair de uma ideia → plano inicial**.  
- **Nº médio de cards criados/refinados por projeto**.  
- **Taxa de exportação de planos para outras ferramentas**.  
- **Engajamento no chat contextual (iterações por card)**.  


---


# 📄 Documento: ideastack-iu.md

# 🎨 Conceitos Visuais – Plataforma de Estruturação Colaborativa com IA  

## 1. Conceito Geral  
- **Paleta sóbria**: predominância de preto, branco e tons de cinza.  
- **Foco no canvas**: o brilho está nas interações, conexões e evolução dos cards.  
- **Uso de cores**: aplicado apenas para comunicar **ação, status ou feedback**, nunca como enfeite.  
- **Estilo visual**: bordas arredondadas, efeito soft, poucas ou nenhuma sombra.  
- **Metáfora**: app de produtividade moderno (ex: Linear, Notion, Figma), mas centrado no **canvas modular**.  

---

## 2. Paleta de Cores  
### Base  
- **Background Light**: #FFFFFF  
- **Background Dark**: #111111  
- **Primary Text**: #1C1C1C  
- **Secondary Text**: #666666  
- **Neutral Border**: #E0E0E0  

### Cores de Estado / Ação  
- **Pendente**: Amarelo #F5C542  
- **Em andamento**: Azul #4A90E2  
- **Concluído**: Verde #57C785  
- **Erro/Bloqueio**: Vermelho #E74C3C  
- **IA em ação**: Roxo #7A5FFF (opcional, usado em loading ou highlight de respostas)  

---

## 3. Interface  
- **Sidebar esquerda (Quick Actions)**  
  - Ícones minimalistas para criar novo card, exportar, salvar versões, trocar de projeto.  
- **Canvas central**  
  - Área principal, limpa, com cards móveis e conectáveis.  
  - Mini mapa para navegação rápida.  
- **Sidebar direita (Chat Contextual)**  
  - Painel retrátil para interação com IA por card.  
  - Histórico de versões disponível.  
- **Modo foco**  
  - Oculta barras laterais → usuário fica apenas com o canvas.  

---

## 4. Tipo


---
