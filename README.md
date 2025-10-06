# PIStack — App Idea Stack

> Transforme ideias em planos acionáveis com IA e templates guiados

## 🎯 Sobre o Projeto

PIStack é uma ferramenta para makers e times pequenos que ajuda a converter ideias em planos de trabalho estruturados em minutos, utilizando IA contextual e templates guiados por etapas.

## ✅ Status de Implementação

### **Fase 1: Setup & Fundação** ✅ **CONCLUÍDO**

#### 1. Inicialização do Projeto
- ✅ Next.js 15.5.4 com App Router
- ✅ TypeScript 5
- ✅ Tailwind CSS 4
- ✅ Estrutura de pastas completa

#### 2. Design System (PIStack v1.0)
- ✅ **Tokens CSS Completos**
  - Paleta de cores (dark theme)
  - Cores semânticas (primary, success, warning, danger, info, cyan, rose)
  - Cores por etapa (Ideia, Entendimento, Escopo, Design, Tecnologia, Planejamento)
  - Espaçamentos, raios, sombras
  - Tipografia Inter (400/500/600)
  - Acessibilidade (focus-visible, reduced motion)

#### 3. Dependências Instaladas
- ✅ @clerk/nextjs (Auth)
- ✅ @supabase/supabase-js (Database)
- ✅ @radix-ui/* (Componentes primitivos)
- ✅ lucide-react (Ícones)
- ✅ framer-motion (Animações)
- ✅ zod (Validação)
- ✅ class-variance-authority (CVA)
- ✅ tailwind-merge (Merge de classes)

#### 4. Componentes Base Implementados (18 componentes)

**Inputs & Forms:**
- ✅ Button (primary/secondary/ghost/danger/success + loading state)
- ✅ IconButton (com variantes)
- ✅ Input (com prefix/suffix/error/helperText)
- ✅ Textarea (com error/helperText)
- ✅ Select (Radix UI)
- ✅ Checkbox
- ✅ Switch

**Feedback & Estado:**
- ✅ Badge (DRAFT/READY + variantes semânticas)
- ✅ Chip (com suporte MoSCoW: must/should/could/wont)
- ✅ Toast + Toaster + useToast hook
- ✅ LoadingSpinner (sm/md/lg)
- ✅ Skeleton (text/circular/rectangular)
- ✅ EmptyState (com ícone/título/descrição/action)

**Navegação & Overlays:**
- ✅ Modal (Dialog com header/footer/close)
- ✅ ConfirmationDialog (variant danger/primary)
- ✅ Tooltip
- ✅ DropdownMenu (completo com submenu)
- ✅ Tabs

#### 5. Utilitários & Helpers
- ✅ `cn()` - merge de classes Tailwind
- ✅ `useToast()` - gerenciamento de toasts
- ✅ Types TypeScript completos (Project, Card, Output, Template, etc)

#### 6. Layout & Providers
- ✅ RootLayout com TooltipProvider e Toaster
- ✅ Página de showcase para testar componentes

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

### ✅ Status: **FUNCIONANDO PERFEITAMENTE!**

O projeto está 100% funcional com todos os componentes base implementados e visual alinhado ao Design System PIStack v1.0!

## 📁 Estrutura do Projeto

```
pistack05-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Layout raiz com providers
│   │   ├── page.tsx             # Página de showcase
│   │   └── globals.css          # Design tokens + estilos base
│   ├── components/
│   │   ├── foundation/          # 18 componentes base ✅
│   │   ├── auth/                # (próxima fase)
│   │   ├── projects/            # (próxima fase)
│   │   ├── canvas/              # (próxima fase)
│   │   ├── outputs/             # (próxima fase)
│   │   └── layout/              # (próxima fase)
│   ├── lib/
│   │   ├── utils/               # cn() helper ✅
│   │   ├── supabase/            # (próxima fase)
│   │   ├── clerk/               # (próxima fase)
│   │   └── services/            # (próxima fase)
│   ├── hooks/
│   │   └── useToast.tsx         # Toast management ✅
│   └── types/
│       └── index.ts             # TypeScript definitions ✅
└── docs/                         # Documentação técnica
```

## 🎨 Design System

### Cores

#### Neutros (Dark Theme)
- `--bg`: #0F1115 (fundo)
- `--bg-elev`: #151821 (containers)
- `--stroke`: #242837 (bordas)
- `--text`: #E6E9F2 (texto principal)
- `--text-dim`: #B9BECD (texto secundário)

#### Semânticas
- `--primary`: #7AA2FF (ação/seleção)
- `--success`: #5AD19A (positivo)
- `--warning`: #FFC24B (atenção)
- `--danger`: #FF6B6B (erro)
- `--info`: #9AA7FF (destaque)
- `--cyan`: #8AD3FF (tech)
- `--rose`: #FF8FA3 (planejamento)

#### Cores por Etapa
- **Ideia Base**: primary (#7AA2FF)
- **Entendimento**: info (#9AA7FF)
- **Escopo**: success (#5AD19A)
- **Design**: warning (#FFC24B)
- **Tecnologia**: cyan (#8AD3FF)
- **Planejamento**: rose (#FF8FA3)

### Uso nos Componentes

```tsx
import { Button, Badge, Chip } from '@/components/foundation';

// Buttons
<Button variant="primary">Criar Projeto</Button>
<Button variant="danger" loading>Excluindo...</Button>

// Badges (Card Status)
<Badge status="DRAFT">Rascunho</Badge>
<Badge status="READY">Pronto</Badge>

// Chips (MoSCoW)
<Chip variant="must">Must Have</Chip>
<Chip variant="should" onRemove={() => {}}>Should Have</Chip>

// Toast
import { toast } from '@/hooks/useToast';
toast({
  title: 'Sucesso!',
  description: 'Projeto criado',
  variant: 'success'
});
```

## 📚 Próximas Fases

### **Fase 2: Autenticação (Clerk)**
- [ ] Setup Clerk (middleware, providers)
- [ ] Páginas `/sign-in` e `/sign-up`
- [ ] `/post-auth` com ProjectGate
- [ ] Helpers de autenticação

### **Fase 3: Lista de Projetos**
- [ ] Setup Supabase (migrations, RLS)
- [ ] Componentes ProjectsPage, ProjectTile, ProjectGrid
- [ ] CRUD de projetos
- [ ] Hooks useProjects, useDebouncedAutosave

### **Fase 4: Canvas & Cards**
- [ ] CanvasShell, CanvasToolbar, CanvasViewport
- [ ] Card wrapper genérico
- [ ] IdeaBaseCard com StageChecklist
- [ ] ScopeFeaturesCard, TechStackCard
- [ ] AIPanel (Generate/Expand/Review)
- [ ] OutputsModal (PRD/Prompt Pack/Work Plan)

### **Fase 5: Serviços & Integrações**
- [ ] ContextService (agregação de contexto)
- [ ] AIGenerationService (IA)
- [ ] OutputService (compilação de outputs)
- [ ] CompletionService (progresso e gates)

## 📖 Documentação de Referência

Consulte a pasta `docs/` para especificações completas:
- `prd-global-pistack.md` - Requisitos do produto
- `architecture_v_2.md` - Arquitetura técnica (Supabase + Clerk)
- `guia_visual_pistack.md` - Design system completo
- `component_inventory_app_idea_stack_v_1.md` - Inventário de componentes

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, CVA
- **UI Components**: Radix UI, Lucide Icons
- **Auth**: Clerk
- **Database**: Supabase (Postgres + RLS)
- **Animation**: Framer Motion
- **Validation**: Zod

## 📝 Licença

Privado - Todos os direitos reservados

---

**Desenvolvido por:** Junior Augusto  
**Data:** Outubro 2025  
**Versão:** 0.1.0 (MVP em desenvolvimento)
