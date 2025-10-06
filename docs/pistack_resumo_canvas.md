# 📌 Resumo do Projeto — PIStack / App Idea Stack

## 1. Visão Geral do Projeto
O PIStack (App Idea Stack) é uma **plataforma de estruturação colaborativa com IA** que auxilia makers, PMs, designers e desenvolvedores a transformarem ideias iniciais em planos executáveis.  
O produto organiza o processo de criação em torno de um **canvas modular**, onde cada etapa do projeto é representada por **cards inteligentes**, conectados e alimentados por IA contextual.  

**Objetivo Principal:** reduzir a distância entre a **ideação** e a **execução**, oferecendo **documentação estruturada**, **outputs automáticos** (PRD, Work Plan, Prompt Pack) e suporte de IA em cada etapa.

---

## 2. Conceitos Visuais
A identidade visual do PIStack foi projetada para manter o **canvas como protagonista**, transmitindo leveza e clareza.  

### Princípios
- **Canvas em foco**: cromia neutra, uso mínimo de cores (somente para ações e estados).  
- **Estilo visual**: bordas arredondadas, sombras suaves, animações discretas.  
- **Hierarquia tipográfica**: tipografia clara, duas hierarquias por card no máximo.  
- **Consistência modular**: todos os cards compartilham anatomia semelhante.  
- **Acessibilidade**: contraste AA, foco visível, alvos ≥44px.  

### Paleta e Tokens
- **Neutros (dark)**: fundo `#0F1115`, containers `#151821`, texto `#E6E9F2`.  
- **Cores de estado**:  
  - **Primary**: Azul #7AA2FF → ações.  
  - **Success**: Verde #5AD19A → confirmações.  
  - **Warning**: Amarelo #FFC24B → atenção.  
  - **Danger**: Vermelho #FF6B6B → erros.  
- **Etapas**: cada fase do projeto tem uma cor de acento sutil (ex.: Ideia Base = azul, Escopo = verde, Planejamento = rosa).  

### Layout
- **Sidebar esquerda**: quick actions.  
- **Canvas central**: cards móveis, zoom/pan, grid discreta.  
- **Sidebar direita (AIPanel)**: interação com IA, revisão e geração de conteúdo.  
- **Modo foco**: permite trabalhar apenas com o canvas, ocultando sidebars.  

---

## 3. Funcionalidades do Canvas

### 3.1 Estrutura de Cards
- **Ideia Base**: primeiro card com campos de Nome, Pitch, Problema, Público, Valor, KPIs e Riscos. Inclui um **checklist clicável** para criar cards das próximas etapas.  
- **Etapas seguintes**:  
  - **Entendimento**: hipóteses, personas e proposta de valor.  
  - **Escopo**: funcionalidades (MoSCoW), requisitos funcionais e não funcionais.  
  - **Design**: conceitos visuais, fluxos de telas, CTAs, estados de erro/sucesso.  
  - **Tecnologia**: stack front/back, banco de dados, integrações e riscos técnicos.  
  - **Planejamento**: critérios de lançamento, métricas e roadmap.  

### 3.2 Interação com IA
- **Generate**: IA sugere campos a partir do contexto do projeto.  
- **Expand**: detalha ou amplia conteúdos existentes.  
- **Review**: verifica consistência e dependências entre cards.  
- **Chat contextual**: cada card pode ter conversas específicas para evoluir seu conteúdo.  

### 3.3 Funcionalidades de Canvas
- **Conexões visuais**: arrastar cards para conectar dependências.  
- **Progresso por etapa**: painel lateral mostrando % de conclusão por estágio.  
- **Outputs automáticos**: geração de **Work Plan, PRD e Prompt Pack** em modal, com cópia ou download.  
- **Autosave & Versionamento**: alterações salvas automaticamente, com suporte a snapshots de versões futuras.  
- **Atalhos de teclado**: ⌘+S para salvar, N para novo card, / para abrir chat contextual.  

### 3.4 Regras de Negócio
- **Work Plan Gate**: liberado apenas após ≥2 cards `READY`.  
- **Checklist**: itens só marcam como concluídos após o card correspondente estar confirmado.  
- **Cross‑propagação**: confirmar funcionalidades gera sugestões em design flow e stack técnica.  

---

## 4. Benefícios do Canvas
- **Clareza**: estrutura modular substitui documentos dispersos.  
- **Rapidez**: outputs prontos em minutos com suporte de IA.  
- **Colaboração futura**: pensado para squads trabalharem em tempo real.  
- **Flexibilidade**: permite criar novos cards e expandir além do template inicial.  

---

## 5. Conclusão
O **PIStack Canvas** centraliza ideação, planejamento e documentação em uma experiência visual, intuitiva e assistida por IA.  
É o coração da plataforma e a base para escalar em direção a colaboração multiusuário, integrações (Jira, Notion, Figma) e outros templates.  
