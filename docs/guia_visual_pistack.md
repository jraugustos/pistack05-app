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

