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

