# Changelog — PIStack

Todas as mudanças notáveis do projeto serão documentadas neste arquivo.

## [0.1.0] - 2025-10-06

### ✅ Implementado

#### Setup & Infraestrutura
- Inicializado projeto Next.js 15.5.4 com App Router
- Configurado TypeScript 5
- Configurado Tailwind CSS 4 com @theme inline
- Estrutura de pastas completa (components, lib, hooks, types)

#### Design System (v1.0)
- **Design Tokens completos** implementados em `globals.css`:
  - Paleta de cores dark (neutros + semânticas)
  - 6 cores por etapa (Ideia, Entendimento, Escopo, Design, Tech, Plan)
  - Sistema de espaçamentos (--s-1 a --s-6)
  - Raios (--radius-sm/md/lg/xl)
  - Sombras (--shadow-1/2)
  - Tipografia Inter (400/500/600)
  - Acessibilidade (focus-visible, reduced motion)

#### Componentes Base (18 componentes)

**Inputs & Forms:**
1. Button (5 variants: primary/secondary/ghost/danger/success)
2. IconButton (3 variants + 3 sizes)
3. Input (com prefix/suffix/error/helperText)
4. Textarea (com error/helperText)
5. Select (Radix UI - completo)
6. Checkbox (Radix UI)
7. Switch (Radix UI)

**Feedback & Estado:**
8. Badge (com suporte CardStatus: DRAFT/READY)
9. Chip (com suporte MoSCoW: must/should/could/wont + removable)
10. Toast (Radix UI - 4 variants)
11. Toaster (container de toasts)
12. LoadingSpinner (3 sizes)
13. Skeleton (3 variants: text/circular/rectangular)
14. EmptyState (icon + title + description + action)

**Navegação & Overlays:**
15. Modal/Dialog (Radix UI - completo com header/footer)
16. ConfirmationDialog (wrapper do Modal para confirmações)
17. Tooltip (Radix UI)
18. DropdownMenu (Radix UI - completo com submenu)
19. Tabs (Radix UI)

#### Utilitários & Hooks
- `cn()` helper (clsx + tailwind-merge)
- `useToast()` hook para gerenciamento de toasts
- Types TypeScript completos (Project, Card, Output, AI, Template, etc)

#### Dependências Instaladas
```json
{
  "@clerk/nextjs": "^6.14.3",
  "@supabase/supabase-js": "^2.47.10",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.462.0",
  "framer-motion": "^11.14.4",
  "zod": "^3.24.1"
}
```

#### Layout & Providers
- RootLayout configurado com:
  - TooltipProvider (Radix UI)
  - Toaster (gerenciamento global de toasts)
  - Metadata do projeto
  - Lang pt-BR

#### Documentação
- README.md completo com status de implementação
- CHANGELOG.md iniciado
- Estrutura de pastas documentada

### 🎨 Design System

**Características:**
- Dark theme como padrão
- Cor usada apenas para ação/estado/identidade
- Hierarquia visual clara
- Contraste AA para acessibilidade
- Focus-visible em todos componentes interativos
- Suporte a reduced-motion

**Cores Semânticas:**
- Primary: #7AA2FF (ação principal)
- Success: #5AD19A (confirmação/positivo)
- Warning: #FFC24B (atenção)
- Danger: #FF6B6B (erro/destrutivo)
- Info: #9AA7FF (destaque informativo)
- Cyan: #8AD3FF (tech/código)
- Rose: #FF8FA3 (planejamento)

### 📦 Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx          ✅ Com providers
│   ├── page.tsx            ✅ Showcase de componentes
│   └── globals.css         ✅ Design tokens completos
├── components/
│   └── foundation/         ✅ 18 componentes base
├── lib/
│   └── utils/              ✅ cn() helper
├── hooks/
│   └── useToast.tsx        ✅ Toast management
└── types/
    └── index.ts            ✅ Types completos
```

### 🔜 Próximas Etapas

#### Fase 2: Autenticação (Sprint 1)
- [ ] Setup Clerk (middleware, appearance)
- [ ] Páginas /sign-in e /sign-up
- [ ] /post-auth com ProjectGate
- [ ] AuthLayout component
- [ ] Helpers de autenticação

#### Fase 3: Lista de Projetos (Sprint 1)
- [ ] Setup Supabase (migrations, RLS)
- [ ] createClerkSupabaseClient helpers
- [ ] ProjectsPage + ProjectGrid + ProjectTile
- [ ] NewProjectModal
- [ ] CRUD completo de projetos
- [ ] useProjects hook

#### Fase 4: Canvas (Sprint 1 + 2)
- [ ] CanvasShell + CanvasToolbar + CanvasViewport
- [ ] Card wrapper genérico
- [ ] IdeaBaseCard com StageChecklist
- [ ] ScopeFeaturesCard + TechStackCard (S1)
- [ ] AIPanel (Generate/Expand/Review)
- [ ] OutputsModal (Work Plan, PRD, Prompt Pack)

---

**Convenções:**
- ✅ = Implementado
- 🔄 = Em desenvolvimento
- 📋 = Planejado
- ⏸️ = Pausado
- ❌ = Cancelado



