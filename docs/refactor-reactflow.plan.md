# Refatoração Canvas: Migração para React Flow

## 🎯 Objetivo

Substituir a implementação atual (CanvasViewport + react-draggable + ConnectionOverlay customizados) por **React Flow** para ganhar:
- ✅ Pan/Zoom/Drag fluido e performático
- ✅ Conexões automáticas entre nodes
- ✅ Menos código para manter
- ✅ Melhor experiência do usuário

---

## 📦 Dependências

### Instalar React Flow
```bash
npm install reactflow
```

### Remover Dependências Antigas
```bash
npm uninstall react-draggable
```

---

## 🗂️ Arquitetura React Flow

### Conceitos Principais

**React Flow trabalha com:**
1. **Nodes** (nossos Cards)
2. **Edges** (nossas Conexões)
3. **Custom Node Types** (IdeaBaseCard, ScopeFeaturesCard, etc.)

### Estrutura de Dados

```typescript
// Node do React Flow = nosso Card
type ReactFlowNode = {
  id: string;
  type: 'ideaBase' | 'scopeFeatures' | 'techStack';
  position: { x: number; y: number };
  data: {
    card: Card; // nosso tipo atual
    onUpdate: (fields: any) => void;
    onDelete: () => void;
    onGenerate: () => void;
    // ... handlers
  };
};

// Edge do React Flow = nossa Conexão
type ReactFlowEdge = {
  id: string;
  source: string; // cardId
  target: string; // cardId
  label?: string;
  animated?: boolean;
  style?: { stroke: string };
};
```

---

## 🚀 Plano de Implementação

### **Fase 1: Setup e Integração Básica** (1-2h)

#### 1.1 Instalar e Configurar React Flow
- [x] Instalar `reactflow`
- [ ] Criar `src/components/canvas/ReactFlowCanvas.tsx` (novo componente base)
- [ ] Importar CSS do React Flow: `import 'reactflow/dist/style.css'`
- [ ] Configurar providers básicos

#### 1.2 Criar Adaptadores
- [ ] `src/lib/utils/reactFlowAdapters.ts`:
  - `cardToNode(card: Card): Node` - converte Card → ReactFlowNode
  - `edgeToReactFlowEdge(edge: Edge): ReactFlowEdge`
  - `nodeToCard(node: Node): Partial<Card>` - para salvar posição

#### 1.3 Substituir CanvasPage
- [ ] Refatorar `src/components/organisms/CanvasPage.tsx`:
  - Remover `CanvasViewport`, `react-draggable`, `ConnectionOverlay`
  - Integrar `<ReactFlow>` component
  - Manter lógica de estado (useCards, useEdges)

---

### **Fase 2: Custom Node Types** (1-2h)

#### 2.1 Criar Wrappers para Cards Existentes
- [ ] `src/components/canvas/nodes/IdeaBaseNode.tsx`:
  ```tsx
  import { NodeProps } from 'reactflow';
  import { IdeaBaseCard } from '@/components/cards/IdeaBaseCard';
  
  export function IdeaBaseNode({ data }: NodeProps) {
    return (
      <div className="bg-bg border border-stroke rounded-lg shadow-lg">
        <IdeaBaseCard
          card={data.card}
          onUpdate={data.onUpdate}
          onChecklistClick={data.onChecklistClick}
        />
      </div>
    );
  }
  ```

- [ ] Criar wrappers similares:
  - `ScopeFeaturesNode.tsx`
  - `TechStackNode.tsx`

#### 2.2 Registrar Node Types
- [ ] Em `ReactFlowCanvas.tsx`:
  ```tsx
  const nodeTypes = {
    ideaBase: IdeaBaseNode,
    scopeFeatures: ScopeFeaturesNode,
    techStack: TechStackNode,
  };
  ```

---

### **Fase 3: Conexões (Edges)** (30min-1h)

#### 3.1 Configurar Edges
- [ ] Estilizar edges no React Flow:
  - `type: 'smoothstep'` ou `'bezier'`
  - `animated: true` para feedback visual
  - `markerEnd: 'arrowclosed'` para setas

#### 3.2 Criar Conexões (Drag & Drop Nativo)
- [ ] Habilitar `<Handle>` nos nodes:
  ```tsx
  import { Handle, Position } from 'reactflow';
  
  // Em cada Node wrapper
  <Handle type="source" position={Position.Right} />
  <Handle type="target" position={Position.Left} />
  ```

- [ ] Implementar `onConnect` handler:
  ```tsx
  const onConnect = useCallback(async (params) => {
    const response = await fetch('/api/edges', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        source_card_id: params.source,
        target_card_id: params.target,
      }),
    });
    // ... atualizar state
  }, [projectId]);
  ```

#### 3.3 Deletar Conexões
- [ ] Usar `onEdgeClick` para selecionar
- [ ] Usar `onEdgesDelete` ou tecla Delete para remover

---

### **Fase 4: Pan/Zoom/Toolbar** (30min)

#### 4.1 Controles Nativos
- [ ] Adicionar `<Controls>` do React Flow (botões zoom in/out/fit)
- [ ] Adicionar `<Background>` com grid (opcional)
- [ ] Configurar `panOnDrag={true}` e `zoomOnScroll={true}`

#### 4.2 Toolbar Customizado
- [ ] Manter nossos botões existentes:
  - "Work Plan" (já existe)
  - "Ajustar Visualização" → usar `fitView()` do React Flow
  - "Conectar" → não precisa mais (drag & drop nativo)
  - "Mão" → não precisa mais (pan nativo com Space ou mouse wheel)

#### 4.3 Atalhos de Teclado
- [ ] React Flow já tem:
  - `Space + Drag` = Pan
  - `Scroll` = Zoom
  - `Delete` = Remove selecionado

---

### **Fase 5: Persistência (GraphService)** (1h)

#### 5.1 Salvar Layout
- [ ] Atualizar `GraphService.saveLayout()`:
  ```typescript
  const saveLayout = async (projectId: string, nodes: Node[], viewport: Viewport) => {
    const graphJSON = {
      version: 2, // nova versão para React Flow
      viewport: {
        x: viewport.x,
        y: viewport.y,
        zoom: viewport.zoom,
      },
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
      })),
    };
    
    await fetch(`/api/projects/${projectId}/graph`, {
      method: 'PUT',
      body: JSON.stringify({ graph: graphJSON }),
    });
  };
  ```

- [ ] Usar `onNodesChange` do React Flow para autosave com debounce

#### 5.2 Carregar Layout
- [ ] No SSR (`src/app/projects/[id]/page.tsx`):
  - Carregar `project.graph`
  - Passar para `ReactFlowCanvas` como `initialNodes`

---

### **Fase 6: Migração de Features Existentes** (1h)

#### 6.1 Criar Card (Checklist Ideia Base)
- [ ] `handleChecklistCreate` agora cria:
  ```typescript
  const newNode: Node = {
    id: newCard.id,
    type: getNodeType(newCard.typeKey),
    position: getCascadePosition(nodes), // usar GraphService
    data: {
      card: newCard,
      onUpdate: handleCardUpdate,
      onDelete: handleCardDelete,
      // ... handlers
    },
  };
  setNodes([...nodes, newNode]);
  ```

- [ ] Auto-conectar ao Ideia Base:
  ```typescript
  const newEdge: Edge = {
    id: `${ideaBaseNode.id}-${newNode.id}`,
    source: ideaBaseNode.id,
    target: newNode.id,
    animated: true,
  };
  setEdges([...edges, newEdge]);
  ```

#### 6.2 Deletar Card
- [ ] Usar `onNodesDelete` do React Flow
- [ ] Deletar no backend + state local

#### 6.3 Selecionar Card → AIPanel
- [ ] Usar `onNodeClick` para setar `selectedCardId`
- [ ] AIPanel já funciona com `selectedCardId`

---

### **Fase 7: Estilo e Polish** (30min-1h)

#### 7.1 Estilizar React Flow
- [ ] Customizar CSS:
  ```css
  /* globals.css */
  .react-flow {
    background: var(--bg);
  }
  
  .react-flow__node {
    border: none !important; /* nossos cards já têm borda */
    background: transparent !important;
  }
  
  .react-flow__edge-path {
    stroke: var(--primary);
    stroke-width: 2;
  }
  
  .react-flow__handle {
    background: var(--primary);
    width: 10px;
    height: 10px;
  }
  ```

#### 7.2 Animações
- [ ] Edges animadas para cards em draft
- [ ] Highlight no node selecionado (usar `selected` prop)

#### 7.3 Onboarding
- [ ] Atualizar hint inicial:
  - "Arraste cards para organizar"
  - "Conecte cards arrastando das alças laterais"
  - "Use Space + Drag para navegar"

---

### **Fase 8: Limpeza e Testes** (30min)

#### 8.1 Remover Código Antigo
- [ ] Deletar arquivos:
  - `src/components/canvas/CanvasViewport.tsx`
  - `src/components/canvas/ConnectionOverlay.tsx`
  - Qualquer código de drag manual

#### 8.2 Atualizar Tipos
- [ ] Remover tipos/interfaces não usados
- [ ] Garantir `Card.position` e `Card.size` ainda existem para compatibilidade

#### 8.3 Testar Fluxos
- [ ] Criar projeto → canvas com Ideia Base
- [ ] Criar card via checklist → aparece conectado
- [ ] Drag card → salva posição
- [ ] Conectar manualmente → persiste no banco
- [ ] Deletar card → remove edges relacionadas
- [ ] Zoom/Pan → fluido

---

## 📝 Checklist de Arquivos

### **Criar:**
- [ ] `src/components/canvas/ReactFlowCanvas.tsx` (novo componente principal)
- [ ] `src/components/canvas/nodes/IdeaBaseNode.tsx`
- [ ] `src/components/canvas/nodes/ScopeFeaturesNode.tsx`
- [ ] `src/components/canvas/nodes/TechStackNode.tsx`
- [ ] `src/lib/utils/reactFlowAdapters.ts`

### **Modificar:**
- [ ] `src/components/organisms/CanvasPage.tsx` (integrar ReactFlowCanvas)
- [ ] `src/lib/services/GraphService.ts` (adaptar para React Flow viewport)
- [ ] `src/app/globals.css` (estilos React Flow)

### **Deletar:**
- [ ] `src/components/canvas/CanvasViewport.tsx`
- [ ] `src/components/canvas/ConnectionOverlay.tsx`

---

## 🎨 Exemplo de Código Final

### ReactFlowCanvas.tsx (simplificado)
```tsx
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';

export function ReactFlowCanvas({ projectId, initialCards, initialEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialCards.map(cardToNode)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map(edgeToReactFlowEdge)
  );

  const onConnect = useCallback(async (params) => {
    // Criar edge no backend
    await createEdge(params.source, params.target);
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background color="#1a1d2e" gap={16} />
    </ReactFlow>
  );
}
```

---

## ⚠️ Pontos de Atenção

1. **Migração Gradual**: Manter branch separada até estabilizar
2. **Compatibilidade**: Cards sem `position` recebem default
3. **Performance**: React Flow já virtualiza, não precisa otimizar manualmente
4. **Mobile**: React Flow tem suporte a touch, mas testar gestures

---

## 📊 Estimativa de Tempo

| Fase | Tempo | Prioridade |
|------|-------|------------|
| 1. Setup e Integração | 1-2h | Alta |
| 2. Custom Nodes | 1-2h | Alta |
| 3. Conexões | 1h | Alta |
| 4. Pan/Zoom/Toolbar | 30min | Média |
| 5. Persistência | 1h | Alta |
| 6. Migração Features | 1h | Alta |
| 7. Estilo e Polish | 1h | Baixa |
| 8. Limpeza e Testes | 30min | Alta |
| **TOTAL** | **6-8h** | - |

---

## 🚀 Próximos Passos

1. ✅ Aprovar este plano
2. [ ] Criar branch `feature/reactflow-canvas`
3. [ ] Instalar dependências
4. [ ] Implementar Fase 1
5. [ ] Testar iterativamente
6. [ ] Merge quando estável

---

## 📚 Referências

- [React Flow Docs](https://reactflow.dev/learn)
- [React Flow Examples](https://reactflow.dev/examples)
- [Custom Nodes Guide](https://reactflow.dev/learn/customization/custom-nodes)
- [Edges Guide](https://reactflow.dev/learn/customization/custom-edges)

