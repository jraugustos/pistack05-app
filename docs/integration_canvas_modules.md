# Integração dos Serviços do Canvas (sem HTML)

Este guia descreve como integrar os serviços TypeScript do Canvas ao app seguindo as diretrizes técnicas (App Router, Clerk + Supabase, telemetria, gate de outputs), sem modificar o HTML de referência.

## Módulos

- `src/types.ts`: Tipos base (GraphJSON, Card, Diff, AIPanelProps, eventos de telemetria).
- `src/services/telemetry.ts`: Fila de telemetria + `emit/emitOnce` (integração futura com Segment/PostHog).
- `src/services/snapshots.ts`: SnapshotService (persistência em `localStorage` + `graph_saved`).
- `src/services/context.ts`: ContextService (resumo ≤1200 chars de Ideia Base + cards READY).
- `src/services/outputs.ts`: OutputService (gate Work Plan ≥2 READY + geração de markdown + `output_generated`).
- `src/panel/aiPanel.ts`: AIPanelService (Generate/Expand/Review, diffs e validações mínimas).

## Integração no App Router (`/projects/:id`)

1. Carregar `project` + `cards/edges` via Server Component (SSR) e repassar `GraphJSON` para Client Components.
2. Instanciar serviços no Client:
   ```ts
   import { telemetry } from '@/src/services/telemetry'
   import { snapshots } from '@/src/services/snapshots'
   import { contextService } from '@/src/services/context'
   import { outputs } from '@/src/services/outputs'
   import { AIPanelService } from '@/src/panel/aiPanel'

   const panel = new AIPanelService(projectId)
   telemetry.emit('canvas_view', { projectId })
   ```

3. Ações de IA por card:
   ```ts
   // Generate
   const { proposal, diff } = panel.generate(card, graph)
   // Expand
   const expanded = panel.expand(card, graph)
   // Review
   const review = panel.review(card, graph)
   // Apply
   const updated = panel.apply(card, proposal)
   ```

4. Snapshots:
   ```ts
   const entry = snapshots.create(graph)
   const restored = snapshots.restore(0) // GraphJSON
   ```

5. Outputs (com gate):
   ```ts
   try {
     const md = outputs.build('workplan', graph)
     // abrir em modal (MarkdownViewer) e permitir Copy/Download
   } catch (e) {
     // exibir guard (Work Plan desabilitado); telemetria é emitida por OutputService
   }
   ```

## Melhores Práticas

- Respeitar RLS (Supabase) com token do Clerk (template `supabase`).
- Debounce de autosave (≈800ms) e snapshots por ação relevante.
- Contexto cacheado por `projectId`; invalidar ao confirmar cards.
- Telemetria ativa em pontos críticos: view, generate/expand, review flags, confirm, outputs, graph_saved e erros de IA.
- Testes unitários para schemas por tipo de card e aplicação de diffs.