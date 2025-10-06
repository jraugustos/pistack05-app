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

