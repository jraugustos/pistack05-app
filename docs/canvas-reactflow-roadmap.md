# Canvas com React Flow - Roadmap de Funcionalidades

## ✅ Já Implementado (Fase 1-4)

### **Setup & Estrutura Base**
- ✅ React Flow instalado e configurado
- ✅ Custom Node types (IdeaBase, ScopeFeatures, TechStack)
- ✅ Handles laterais para conexões drag & drop
- ✅ Pan nativo (Space + drag, middle mouse)
- ✅ Zoom fluido (scroll wheel)
- ✅ Controls nativos (zoom in/out/fit)
- ✅ Background com grid de dots
- ✅ Panel com hint de navegação

### **Conexões (Edges)**
- ✅ Drag & drop entre handles
- ✅ API de edges (`POST /api/edges`, `DELETE /api/edges/[id]`)
- ✅ Edges animadas com smoothstep
- ✅ Validação de duplicatas (local + API)
- ✅ Delete de edges com confirmação
- ✅ Estilo customizado (cor primary, hover, setas)

### **Persistência**
- ✅ Autosave de posições (debounced 800ms)
- ✅ GraphService compatível com React Flow
- ✅ SSR com cards e edges pré-carregados

### **Features Core**
- ✅ Checklist Ideia Base → criar cards
- ✅ Auto-conexão Ideia Base → novos cards
- ✅ Delete de cards (botão X vermelho)
- ✅ AIPanel sempre visível (lateral direita)

---

## 🚀 Próximas Funcionalidades (Adaptadas para React Flow)

### **Fase 5: Melhorias de UX**

#### 5.1 Mini-map para Navegação
**Prioridade:** Alta  
**Esforço:** Baixo (1-2h)

React Flow já tem componente `<MiniMap>` pronto:

```tsx
import { MiniMap } from 'reactflow';

<ReactFlow ...>
  <Controls />
  <Background />
  <MiniMap 
    nodeColor={(node) => {
      switch (node.type) {
        case 'ideaBase': return '#7AA2FF';
        case 'scopeFeatures': return '#5AD19A';
        case 'techStack': return '#8AD3FF';
        default: return '#242837';
      }
    }}
    maskColor="rgba(15, 17, 21, 0.8)"
  />
</ReactFlow>
```

**Benefício:** Visão geral do canvas, especialmente útil em projetos grandes.

---

#### 5.2 Seleção Múltipla e Operações em Lote
**Prioridade:** Média  
**Esforço:** Médio (2-3h)

React Flow suporta nativamente:
- `selectionOnDrag={true}` - arrastar para selecionar múltiplos
- `onSelectionChange` - detectar seleção

**Implementar:**
- Botão "Deletar Selecionados" no toolbar (aparece quando `selectedNodes.length > 1`)
- Botão "Agrupar" (criar um container visual, futuro)
- Keyboard shortcuts: `Delete` para remover selecionados

```tsx
const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

<ReactFlow
  selectionOnDrag={true}
  onSelectionChange={(elements) => {
    setSelectedNodes(elements.nodes);
  }}
  multiSelectionKeyCode="Shift" // Hold Shift to select multiple
/>
```

---

#### 5.3 Auto-Layout Inteligente
**Prioridade:** Alta  
**Esforço:** Alto (4-6h)

Usar algoritmo Dagre para organizar cards automaticamente:

```bash
npm install dagre @types/dagre
```

```tsx
import dagre from 'dagre';

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 360, height: 240 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 180,
        y: nodeWithPosition.y - 120,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
```

**Adicionar botão no toolbar:** "✨ Organizar" que chama `getLayoutedElements` e anima para novas posições.

---

#### 5.4 Histórico de Ações (Undo/Redo)
**Prioridade:** Média  
**Esforço:** Alto (5-7h)

React Flow não tem undo/redo nativo. Precisamos implementar:

**Estratégia:**
- Usar `zustand` com middleware `redux` para histórico
- Salvar snapshots de `nodes` e `edges` a cada ação
- Keyboard shortcuts: `Cmd+Z` (undo), `Cmd+Shift+Z` (redo)

```tsx
import create from 'zustand';
import { temporal } from 'zundo';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

const useCanvasStore = create<CanvasState>()(
  temporal(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
    }),
    { limit: 50 } // últimas 50 ações
  )
);

// Uso:
const { undo, redo } = useCanvasStore.temporal.getState();
```

---

### **Fase 6: Checklist Inteligente do Ideia Base**

#### 6.1 Status Dinâmico no Checklist
**Prioridade:** Alta  
**Esforço:** Médio (3-4h)

**Objetivo:** Mostrar status visual de cada etapa:
- ⚪ Pendente (card não existe)
- 🟡 Em Progresso (card DRAFT existe)
- 🟢 Concluído (card READY)

**Implementação em `IdeaBaseCard.tsx`:**

```tsx
const getChecklistStatus = (stageKey: string, typeKey: string) => {
  const card = cards.find(c => c.stageKey === stageKey && c.typeKey === typeKey);
  
  if (!card) return 'pending';
  if (card.status === 'READY') return 'completed';
  return 'in_progress';
};

const checklist = [
  { stageKey: 'escopo', typeKey: 'scope.features', label: 'Definir Escopo' },
  { stageKey: 'tech', typeKey: 'tech.stack', label: 'Escolher Tech Stack' },
];

checklist.map(item => {
  const status = getChecklistStatus(item.stageKey, item.typeKey);
  
  return (
    <Button
      key={item.typeKey}
      onClick={() => {
        if (status === 'pending') {
          onChecklistClick(item); // Cria card
        } else {
          // Foca card existente (scroll + highlight)
          const existingCard = cards.find(c => c.typeKey === item.typeKey);
          if (existingCard) {
            reactFlowInstance.fitView({ nodes: [existingCard.id] });
          }
        }
      }}
    >
      {status === 'pending' && <Circle className="w-4 h-4" />}
      {status === 'in_progress' && <Clock className="w-4 h-4 text-warning" />}
      {status === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
      {item.label}
    </Button>
  );
});
```

---

#### 6.2 Visual Especial para Ideia Base
**Prioridade:** Baixa  
**Esforço:** Baixo (30min)

- Adicionar glow sutil: `box-shadow: 0 0 20px rgba(122, 162, 255, 0.3)`
- Badge "Origem" no header
- Border mais grossa: `border-3 border-primary`

```tsx
// Em IdeaBaseNode.tsx
<div
  className={cn(
    "bg-bg border-3 rounded-lg shadow-xl transition-all",
    selected ? "border-primary ring-4 ring-primary/30" : "border-primary/70",
    "shadow-primary/20" // Glow sutil
  )}
  style={{ boxShadow: '0 0 20px rgba(122, 162, 255, 0.3)' }}
>
```

---

### **Fase 7: Melhorias de Conexões**

#### 7.1 Tipos de Conexões (Labels Visuais)
**Prioridade:** Média  
**Esforço:** Médio (2-3h)

Adicionar tipos de conexão com cores diferentes:

```tsx
enum EdgeType {
  DERIVES = 'derives',      // Ideia Base → Cards (azul)
  DEPENDS = 'depends',      // Card → Card dependência (amarelo)
  REFERENCES = 'references' // Card → Card referência (cinza)
}

const edgeTypes = {
  derives: { color: '#7AA2FF', label: 'deriva de' },
  depends: { color: '#FFC24B', label: 'depende de' },
  references: { color: '#8A90A6', label: 'referencia' },
};
```

**UI:** Ao criar conexão, exibir modal para escolher tipo.

---

#### 7.2 Conexões Curvas Customizadas
**Prioridade:** Baixa  
**Esforço:** Médio (2-3h)

React Flow permite custom edge types:

```tsx
import { getBezierPath, EdgeProps } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={3}
        stroke={data?.color || '#7AA2FF'}
      />
      {data?.label && (
        <text>
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};
```

---

### **Fase 8: Colaboração (Futuro)**

#### 8.1 Cursores em Tempo Real
**Prioridade:** Baixa  
**Esforço:** Alto (7-10h)

Usar Supabase Realtime para mostrar cursores de outros usuários:

```tsx
const channel = supabase.channel(`project:${projectId}`);

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    // Renderizar cursores de outros usuários
  })
  .subscribe();
```

---

#### 8.2 Comentários em Cards
**Prioridade:** Baixa  
**Esforço:** Médio (3-4h)

Adicionar badge com count de comentários em cada card. Ao clicar, abre modal com thread.

---

### **Fase 9: Outputs Visuais**

#### 9.1 Export para PNG/PDF
**Prioridade:** Média  
**Esforço:** Médio (2-3h)

React Flow tem método nativo:

```tsx
import { toPng } from 'html-to-image';

const downloadImage = () => {
  const viewport = document.querySelector('.react-flow__viewport');
  toPng(viewport as HTMLElement).then((dataUrl) => {
    const link = document.createElement('a');
    link.download = `${project.name}-canvas.png`;
    link.href = dataUrl;
    link.click();
  });
};
```

Adicionar botão "📸 Exportar Canvas" no toolbar.

---

#### 9.2 Apresentação Mode (View-Only)
**Prioridade:** Baixa  
**Esforço:** Baixo (1h)

Adicionar botão "🎥 Modo Apresentação":
- Oculta toolbar, AIPanel, botões de edição
- Cards ficam read-only
- Ideal para demos e reviews

```tsx
<ReactFlow
  nodesDraggable={!presentationMode}
  nodesConnectable={!presentationMode}
  elementsSelectable={!presentationMode}
/>
```

---

## 📊 Resumo de Prioridades

| Fase | Funcionalidade | Prioridade | Esforço | Impacto |
|------|----------------|------------|---------|---------|
| 5.1 | Mini-map | Alta | Baixo | Alto |
| 5.3 | Auto-Layout | Alta | Alto | Alto |
| 6.1 | Checklist Status | Alta | Médio | Alto |
| 5.2 | Seleção Múltipla | Média | Médio | Médio |
| 5.4 | Undo/Redo | Média | Alto | Médio |
| 7.1 | Tipos de Conexão | Média | Médio | Médio |
| 9.1 | Export PNG/PDF | Média | Médio | Médio |
| 6.2 | Visual Ideia Base | Baixa | Baixo | Baixo |
| 7.2 | Edges Customizadas | Baixa | Médio | Baixo |
| 9.2 | Modo Apresentação | Baixa | Baixo | Baixo |
| 8.1 | Cursores Realtime | Baixa | Alto | Baixo |
| 8.2 | Comentários | Baixa | Médio | Baixo |

---

## 🎯 Próximos Passos Sugeridos

**Implementar agora (Quick Wins):**
1. ✨ **Mini-map** - componente pronto, copy/paste
2. 🎨 **Visual Ideia Base** - CSS simples, efeito grande
3. 📋 **Checklist Status** - melhora muito UX

**Implementar semana que vem:**
4. 🤖 **Auto-Layout** - feature killer, mas trabalhosa
5. 🔄 **Undo/Redo** - essencial para produtividade

**Backlog (Conforme Necessidade):**
6. Seleção múltipla
7. Tipos de conexão
8. Export PNG/PDF

---

## 🛠️ Dependências Adicionais

```bash
# Auto-layout
npm install dagre @types/dagre

# Undo/Redo
npm install zundo

# Export imagem
npm install html-to-image
```

---

**Nota:** Todas as funcionalidades listadas são **nativas ou extensões do React Flow**, aproveitando sua arquitetura. Não precisamos reinventar a roda! 🚀

